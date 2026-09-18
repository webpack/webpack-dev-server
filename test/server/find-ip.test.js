import os from "node:os";
import { describe, it } from "node:test";
import { expect } from "expect";
import { spyOn } from "jest-mock";
import Server from "../../lib/Server.js";

describe("Server.findIp", () => {
  it("skips incomplete interfaces and returns the first matching address", async () => {
    const networkInterfacesMock = spyOn(
      os,
      "networkInterfaces",
    ).mockImplementation(() => ({
      missing: undefined,
      incomplete: [null, { address: "", cidr: null }],
      primary: [
        {
          address: "192.168.1.10",
          family: "IPv4",
          internal: false,
          cidr: "192.168.1.10/24",
        },
        {
          address: "192.168.1.11",
          family: "IPv4",
          internal: false,
          cidr: "192.168.1.11/24",
        },
        {
          address: "fd00::10",
          family: "IPv6",
          internal: false,
          cidr: "fd00::10/64",
        },
      ],
    }));

    try {
      expect(Server.findIp("v4", false)).toBe("192.168.1.10");
      expect(Server.findIp("v6", false)).toBe("[fd00::10]");
      expect(Server.findIp("192.168.1.42")).toBe("192.168.1.10");
      await expect(Server.getHostname("local-ipv6")).resolves.toBe("fd00::10");
    } finally {
      networkInterfacesMock.mockRestore();
    }
  });
});
