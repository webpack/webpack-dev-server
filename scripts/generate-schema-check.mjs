import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Ajv, { _ } from "ajv";
import standaloneCode from "ajv/dist/standalone/index.js";

// Precompile `lib/options.json` into a standalone validator, `lib/options.check.js`.
//
// `schema-utils`'s `validate()` compiles the schema with ajv on its first call,
// which cost ~120ms of every `new Server()` — a one-time startup price paid by
// every user on every run. The generated validator answers the same question
// with no compile step, so the happy path never loads ajv at all; `Server` only
// falls back to `schema-utils` when this validator rejects, to build the
// readable error message (the same trick webpack uses for its own schema).
//
// Run `npm run fix:schema-check` to regenerate, `npm run lint:schema-check` to
// verify the committed output is current.

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SCHEMA_PATH = path.join(ROOT, "lib", "options.json");
const OUTPUT_PATH = path.join(ROOT, "lib", "options.check.js");

const BANNER = `// This file was automatically generated.
// DO NOT MODIFY BY HAND. Run \`npm run fix:schema-check\` to update.
/* eslint-disable */
// @ts-nocheck
`;

/**
 * The constructors `"instanceof"` may name. ajv-keywords implements the keyword
 * with a closure, which cannot be serialized into standalone code, so the
 * keyword is re-implemented here as something ajv can emit inline.
 */
const CONSTRUCTORS = {
  Buffer: _`Buffer`,
  Function: _`Function`,
};

/** @typedef {Record<string, unknown>} SchemaNode */

/**
 * Walk every schema node, depth first.
 * @param {unknown} node current node
 * @param {(node: SchemaNode, pointer: string) => void} visit called for each object node
 * @param {string} pointer JSON pointer to `node`
 * @returns {void}
 */
function walkSchema(node, visit, pointer = "#") {
  if (!node || typeof node !== "object") {
    return;
  }

  if (!Array.isArray(node)) {
    visit(/** @type {SchemaNode} */ (node), pointer);
  }

  for (const [key, value] of Object.entries(node)) {
    walkSchema(value, visit, `${pointer}/${key}`);
  }
}

/**
 * Reject schema constructs the generated validator would silently mistranslate.
 * @param {SchemaNode} schema the options schema
 * @returns {void}
 */
function assertSupportedSchema(schema) {
  /**
   * @param {SchemaNode} node the schema node to check
   * @param {string} pointer JSON pointer to `node`
   * @returns {void}
   */
  const assertNode = (node, pointer) => {
    // `unicode: false` below makes ajv measure string length in UTF-16 code
    // units rather than code points. The two agree only at a bound of 1, where
    // both mean "not empty".
    if (node.minLength !== undefined && node.minLength !== 1) {
      throw new Error(
        `"minLength" must be 1, but is ${node.minLength} at ${pointer}.`,
      );
    }

    if (node.maxLength !== undefined) {
      throw new Error(`"maxLength" is not supported, found at ${pointer}.`);
    }

    if (
      typeof node.instanceof === "string" &&
      !Object.hasOwn(CONSTRUCTORS, node.instanceof)
    ) {
      throw new Error(
        `"instanceof": ${JSON.stringify(node.instanceof)} at ${pointer} is not supported. Add it to CONSTRUCTORS.`,
      );
    }
  };

  walkSchema(schema, assertNode);
}

/**
 * @param {SchemaNode} schema the options schema
 * @returns {string} source of the standalone validator
 */
function generate(schema) {
  assertSupportedSchema(schema);

  const ajv = new Ajv({
    /* eslint-disable no-console -- a generator reports to the terminal */
    logger: {
      log: console.log,
      /**
       * `unicode` is deprecated but still honoured, and `assertSupportedSchema`
       * has already established that dropping it changes nothing here.
       * @param {...unknown} args ajv's warning arguments
       * @returns {void}
       */
      warn: (...args) => {
        if (!String(args[0]).includes("option unicode")) {
          console.warn(...args);
        }
      },
      error: console.error,
    },
    /* eslint-enable no-console */
    strict: false,
    // The validator only reports whether the options are valid; `schema-utils`
    // produces the messages, so collecting every error here would be wasted work.
    allErrors: false,
    verbose: false,
    unicode: false,
    code: { source: true, esm: true },
  });

  ajv.addKeyword({
    keyword: "instanceof",
    schemaType: "string",
    /**
     * @param {import("ajv").KeywordCxt} cxt keyword context
     * @returns {void}
     */
    code(cxt) {
      cxt.fail(
        _`!(${cxt.data} instanceof ${CONSTRUCTORS[/** @type {keyof typeof CONSTRUCTORS} */ (cxt.schema)]})`,
      );
    },
  });

  // Documentation-only keywords carried by the schema for the CLI and the docs.
  for (const keyword of ["cli", "link"]) {
    ajv.addKeyword({ keyword, schemaType: ["string", "object", "boolean"] });
  }

  return BANNER + standaloneCode.default(ajv, ajv.compile(schema));
}

const source = generate(JSON.parse(await readFile(SCHEMA_PATH, "utf8")));

if (process.argv.includes("--check")) {
  const current = await readFile(OUTPUT_PATH, "utf8").catch(() => undefined);

  if (current !== source) {
    // eslint-disable-next-line no-console
    console.error(
      `${path.relative(ROOT, OUTPUT_PATH)} is out of date — run \`npm run fix:schema-check\`.`,
    );
    process.exitCode = 1;
  }
} else {
  await writeFile(OUTPUT_PATH, source);
}
