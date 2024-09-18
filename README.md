2024-09-18T02:11:34.4258587Z Mevcut koşucu sürümü: '2.319.1'
2024-09-18T02:11:34.4280054Z ##[group]İşletim Sistemi
2024-09-18T02:11:34.4280605Z Microsoft Windows Server 2022
2024-09-18T02:11:34.4280980Z 10.0.20348
2024-09-18T02:11:34.4281278Z Veri Merkezi
2024-09-18T02:11:34.4281566Z ##[son grup]
2024-09-18T02:11:34.4281846Z ##[grup]Koşucu Resmi
2024-09-18T02:11:34.4282215Z Resim: windows-2022
2024-09-18T02:11:34.4282546Z Sürüm: 20240912.1.0
2024-09-18T02:11:34.4283409Z Dahil Edilen Yazılım: https://github.com/actions/runner-images/blob/win22/20240912.1/images/windows/Windows2022-Readme.md
2024-09-18T02:11:34.4284685Z Görüntü Sürümü: https://github.com/actions/runner-images/releases/tag/win22%2F20240912.1
2024-09-18T02:11:34.4285435Z ##[son grup]
2024-09-18T02:11:34.4285743Z ##[group]Runner Görüntü Sağlayıcı
2024-09-18T02:11:34.4286161Z 2.0.384.1
2024-09-18T02:11:34.4286440Z ##[son grup]
2024-09-18T02:11:34.4299879Z ##[group]GITHUB_TOKEN İzinleri
2024-09-18T02:11:34.4301459Z İçerikler: oku
2024-09-18T02:11:34.4301926Z Meta veri: okundu
2024-09-18T02:11:34.4302224Z ##[son grup]
2024-09-18T02:11:34.4304938Z Gizli kaynak: Dependabot
2024-09-18T02:11:34.4305454Z İş akışı dizinini hazırla
2024-09-18T02:11:34.5116659Z Gerekli tüm eylemleri hazırlayın
2024-09-18T02:11:34.5298695Z Eylem indirme bilgisi alınıyor
2024-09-18T02:11:34.7306777Z Eylem deposunu indirin 'actions/checkout@v4' (SHA:692973e3d937129bcbf40652eb9f2f61becf3332)
2024-09-18T02:11:34.9372475Z Eylem deposunu indirin 'actions/setup-node@v4' (SHA:1e60f620b9541d16bece96c5465dc8ee9832be0b)
2024-09-18T02:11:35.1174996Z 'browser-actions/setup-firefox@latest' eylem deposunu indirin (SHA:955a5d42b5f068a8917c6a4ff1656a2235c66dfb)
2024-09-18T02:11:35.2979969Z Eylem deposunu indirin 'codecov/codecov-action@v4' (SHA:e28ff129e5465c2c0dcc6f003fc735cb6ae0c673)
2024-09-18T02:11:35.6408722Z İşin tam adı: Test - windows-latest - Node v20.x, Webpack latest (1/4)
2024-09-18T02:11:35.7550712Z ##[group]Eylemleri/ödemeyi@v4'te çalıştır
2024-09-18T02:11:35.7551330Z ile:
2024-09-18T02:11:35.7551712Z deposu: webpack/webpack-dev-server
2024-09-18T02:11:35.7552480Z belirteci: ***
2024-09-18T02:11:35.7552821Z ssh-strict: doğru
2024-09-18T02:11:35.7553172Z ssh kullanıcısı: git
2024-09-18T02:11:35.7553529Z kalıcı kimlik bilgileri: doğru
2024-09-18T02:11:35.7553933Z temiz: doğru
2024-09-18T02:11:35.7554275Z seyrek-ödeme-koni-modu: doğru
2024-09-18T02:11:35.7554731Z getirme derinliği: 1
2024-09-18T02:11:35.7555053Z etiketleri getir: false
2024-09-18T02:11:35.7555387Z show-progress: true
2024-09-18T02:11:35.7555726Z lfs: yanlış
2024-09-18T02:11:35.7556023Z alt modüller: false
2024-09-18T02:11:35.7556365Z güvenli dizin ayarlandı: true
2024-09-18T02:11:35.7556762Z ##[son grup]
2024-09-18T02:11:36.5070686Z Depo senkronize ediliyor: webpack/webpack-dev-server
2024-09-18T02:11:36.5072602Z ##[group]Git sürüm bilgisi alınıyor
2024-09-18T02:11:36.5073308Z Çalışma dizini 'D:\a\webpack-dev-server\webpack-dev-server'
2024-09-18T02:11:36.7831690Z [komut]"C:\Program Files\Git\bin\git.exe" sürümü
2024-09-18T02:11:36.9089360Z git sürümü 2.46.0.windows.1
2024-09-18T02:11:36.9103596Z ##[son grup]
2024-09-18T02:11:36.9191124Z Genel git yapılandırma değişiklikleri yapmadan önce HOME='D:\a\_temp\ff895a39-e256-4506-83c4-7ddb82da18a7' geçici olarak geçersiz kılınıyor
2024-09-18T02:11:36.9193080Z Depo dizinini geçici git genel yapılandırmasına güvenli dizin olarak ekleme
2024-09-18T02:11:36.9204558Z [komut]"C:\Program Dosyaları\Git\bin\git.exe" config --global --add güvenli.dizin D:\a\webpack-dev-server\webpack-dev-server
2024-09-18T02:11:36.9991561Z 'D:\a\webpack-dev-server\webpack-dev-server' içeriği siliniyor
2024-09-18T02:11:36.9996717Z ##[group]Depo başlatılıyor
2024-09-18T02:11:37.0006359Z [komut]"C:\Program Dosyaları\Git\bin\git.exe" init D:\a\webpack-dev-server\webpack-dev-server
2024-09-18T02:11:37.1147931Z D:/a/webpack-dev-server/webpack-dev-server/.git/ dizininde boş Git deposu başlatıldı
2024-09-18T02:11:37.1186396Z [komut]"C:\Program Files\Git\bin\git.exe" uzaktan kaynak ekle https://github.com/webpack/webpack-dev-server
2024-09-18T02:11:37.1747275Z ##[son grup]
2024-09-18T02:11:37.1747773Z ##[group]Otomatik çöp toplamayı devre dışı bırakma
2024-09-18T02:11:37.1757276Z [komut]"C:\Program Dosyaları\Git\bin\git.exe" config --local gc.auto 0
2024-09-18T02:11:37.1970584Z ##[son grup]
2024-09-18T02:11:37.1971483Z ##[group]Kimlik doğrulaması ayarlanıyor
2024-09-18T02:11:37.1984906Z [komut]"C:\Program Dosyaları\Git\bin\git.exe" yapılandırması --local --name-only --get-regexp core\.sshKomutu
2024-09-18T02:11:37.2206912Z [komut]"C:\Program Files\Git\bin\git.exe" alt modülü foreach --recursive "sh -c \"git config --local --name-only --get-regexp 'core\.sshCommand' && git config --local --unset-all 'core.sshCommand' || :\""
2024-09-18T02:11:39.0501229Z [komut]"C:\Program Files\Git\bin\git.exe" config --local --name-only --get-regexp http\.https\:\/\/github\.com\/\.extraheader
2024-09-18T02:11:39.0717174Z [komut]"C:\Program Files\Git\bin\git.exe" alt modülü foreach --recursive "sh -c \"git config --local --name-only --get-regexp 'http\.https\:\/\/github\.com\/\.extraheader' && git config --local --unset-all 'http.https://github.com/.extraheader' || :\""
2024-09-18T02:11:39.4638507Z [komut]"C:\Program Files\Git\bin\git.exe" config --local http.https://github.com/.extraheader "YETKİLENDİRME: temel ***"
2024-09-18T02:11:39.4858773Z ##[son grup]
2024-09-18T02:11:39.4859501Z ##[group]Depo getiriliyor
2024-09-18T02:11:39.4873842Z [komut]"C:\Program Dosyaları\Git\bin\git.exe" -c protokol.sürüm=2 fetch --no-tags --prune --no-recurse-submodules --depth=1 origin +15bc4dec9461ec5cf439252c5ae04f44a63a2268:refs/remotes/pull/5299/merge
2024-09-18T02:11:41.3727611Z https://github.com/webpack/webpack-dev-server adresinden
2024-09-18T02:11:41.3728766Z * [yeni referans] 15bc4dec9461ec5cf439252c5ae04f44a63a2268 -> çek/5299/birleştir
2024-09-18T02:11:41.4019947Z ##[son grup]
2024-09-18T02:11:41.4023367Z ##[group]Ödeme bilgilerini belirleme
2024-09-18T02:11:41.4024337Z ##[son grup]
2024-09-18T02:11:41.4034459Z [komut]"C:\Program Files\Git\bin\git.exe" seyrek-ödeme devre dışı bırak
2024-09-18T02:11:41.4444387Z [komut]"C:\Program Dosyaları\Git\bin\git.exe" config --local --unset-all uzantıları.worktreeConfig
2024-09-18T02:11:41.4652502Z ##[group]Referansı kontrol ediyorum
2024-09-18T02:11:41.4661143Z [komut]"C:\Program Files\Git\bin\git.exe" checkout --progress --force refs/remotes/pull/5299/merge
2024-09-18T02:11:41.6037292Z Not: 'refs/remotes/pull/5299/merge' klasörüne geçiliyor.
2024-09-18T02:11:41.6038202Z
2024-09-18T02:11:41.6038849Z 'Bağımsız BAŞ' durumundasınız. Etrafınıza bakabilir, deneysel yapabilirsiniz
2024-09-18T02:11:41.6039922Z değişiklikleri yapın ve bunları kaydedin ve bunda yaptığınız tüm değişiklikleri iptal edebilirsiniz.
2024-09-18T02:11:41.6040883Z herhangi bir dalı etkilemeden bir dala geri dönerek durumu düzeltin.
2024-09-18T02:11:41.6041494Z
2024-09-18T02:11:41.6042075Z Oluşturduğunuz commitleri saklamak için yeni bir dal oluşturmak istiyorsanız,
2024-09-18T02:11:41.6043133Z bunu (şimdi veya daha sonra) switch komutuyla -c kullanarak yapın. Örnek:
2024-09-18T02:11:41.6043689Z
2024-09-18T02:11:41.6043914Z git switch -c <yeni-dal-adı>
2024-09-18T02:11:41.6044237Z
2024-09-18T02:11:41.6044392Z Veya bu işlemi şu şekilde geri alın:
2024-09-18T02:11:41.6044680Z
2024-09-18T02:11:41.6044799Z git anahtarı -
2024-09-18T02:11:41.6045007Z
2024-09-18T02:11:41.6045548Z advice.detachedHead yapılandırma değişkenini false olarak ayarlayarak bu tavsiyeyi kapatın
2024-09-18T02:11:41.6046178Z
2024-09-18T02:11:41.6046840Z HEAD şu anda 15bc4de adresinde bf55520f9807346e85b4bed45535f0200209f8f9'u 07324ecb7e8c88a4ec6724df279f9e6ad3fcac6e ile birleştir
2024-09-18T02:11:41.6066669Z ##[son grup]
2024-09-18T02:11:41.6312835Z [komut]"C:\Program Dosyaları\Git\bin\git.exe" log -1 --format='%H'
2024-09-18T02:11:41.6499642Z '15bc4dec9461ec5cf439252c5ae04f44a63a2268'
2024-09-18T02:11:41.7175829Z ##[group]Actions/setup-node@v4'ü çalıştırın
2024-09-18T02:11:41.7176191Z ile:
2024-09-18T02:11:41.7176384Z düğüm sürümü: 20.x
2024-09-18T02:11:41.7176618Z önbellek: npm
2024-09-18T02:11:41.7176832Z her zaman-kimlik doğrulama: yanlış
2024-09-18T02:11:41.7177785Z son durum kontrolü: yanlış
2024-09-18T02:11:41.7178193Z belirteci: ***
2024-09-18T02:11:41.7178399Z ##[son grup]
2024-09-18T02:11:41.9999680Z C:\hostedtoolcache\windows\node\20.17.0\x64 adresindeki önbellekte bulundu
2024-09-18T02:11:42.0008729Z ##[group]Ortam ayrıntıları
2024-09-18T02:11:54.4167011Z düğüm: v20.17.0
2024-09-18T02:11:54.4167580Z npm: 10.8.2
2024-09-18T02:11:54.4167794Z iplik: 1.22.22
2024-09-18T02:11:54.4168425Z ##[son grup]
2024-09-18T02:11:54.4960356Z [komut]C:\Windows\system32\cmd.exe /D /S /C "C:\hostedtoolcache\windows\node\20.17.0\x64\npm.cmd yapılandırma önbelleği al"
2024-09-18T02:11:55.6958724ZC:\npm\önbellek
2024-09-18T02:11:56.2103717Z npm önbelleği bulunamadı
2024-09-18T02:11:56.2451390Z ##[group]npm ci'yi çalıştır
2024-09-18T02:11:56.2451811Z [36;1dkpm ci [0dk
2024-09-18T02:11:56.2487814Z kabuk: C:\Program Files\PowerShell\7\pwsh.EXE -komut ". '{0}'"
2024-09-18T02:11:56.2488334Z ##[son grup]
2024-09-18T02:12:05.9159700Z npm warn deprecated stringify-package@1.0.1: Bu modül artık kullanılmıyor ve @npmcli/package-json ile değiştirildi
2024-09-18T02:12:08.1719570Z npm warn deprecated inflight@1.0.6: Bu modül desteklenmiyor ve bellek sızdırıyor. Kullanmayın. Asenkron istekleri bir anahtar değeriyle birleştirmenin iyi ve test edilmiş bir yolunu istiyorsanız lru-cache'e göz atın, bu çok daha kapsamlı ve güçlüdür.
2024-09-18T02:12:08.2947084Z npm warn deprecated q@1.5.1: Siz veya güvendiğiniz biri, JavaScript geliştiricilerine promise'ler hakkında güçlü hisler veren JavaScript Promise kütüphanesi Q'yu kullanıyor. Artık neredeyse kesinlikle yerel JavaScript promise'e geçebilirler. Bu bahse benimle birlikte katıldığınız için hepinize teşekkür ederim. Birbirinize karşı mükemmel olun.
2024-09-18T02:12:08.2953004Z npm warn kullanım dışı bırakıldı
2024-09-18T02:12:08.2954724Z npm warn kullanım dışı bırakıldı (Yerel vaatlere sahip bir CapTP için @endo/eventual-send ve @endo/captp'ye bakın)
2024-09-18T02:12:12.2638363Z npm warn deprecated glob@7.2.3: v9'dan önceki Glob sürümleri artık desteklenmiyor
2024-09-18T02:12:13.1379619Z npm warn kullanım dışı bırakıldı @humanwhocodes/config-array@0.13.0: Bunun yerine @eslint/config-array kullanın
2024-09-18T02:12:13.9152884Z npm warn kullanım dışı bırakıldı abab@2.0.6: Bunun yerine platformunuzun yerel atob() ve btoa() yöntemlerini kullanın
2024-09-18T02:12:14.4817669Z npm warn kullanım dışı bırakıldı @humanwhocodes/object-schema@2.0.3: Bunun yerine @eslint/object-schema kullanın
2024-09-18T02:12:14.5334323Z npm warn rimraf@3.0.2 kullanım dışı bırakıldı: v4 öncesi Rimraf sürümleri artık desteklenmiyor
2024-09-18T02:12:14.6034997Z npm warn deprecated domexception@4.0.0: Bunun yerine platformunuzun yerel DOMException'ını kullanın
2024-09-18T02:12:31.6315016Z
2024-09-18T02:12:31.6317445Z > webpack-dev-server@5.1.0 hazırla
2024-09-18T02:12:31.6318219Z > husky && npm build'i çalıştır
2024-09-18T02:12:31.6318535Z
2024-09-18T02:12:32.1439035Z
2024-09-18T02:12:32.1439875Z > webpack-dev-server@5.1.0 derlemesi
2024-09-18T02:12:32.1440748Z > npm-run-all -p "derleme:**"
2024-09-18T02:12:32.1441130Z
2024-09-18T02:12:32.8539350Z
2024-09-18T02:12:32.8540637Z > webpack-dev-server@5.1.0 yapı:istemci
2024-09-18T02:12:32.8543388Z > rimraf -g ./client/* && babel client-src/ --out-dir client/ --ignore "client-src/webpack.config.js" --ignore "client-src/modüller" && webpack --config client-src/webpack.config.js
2024-09-18T02:12:32.8544858Z
2024-09-18T02:12:32.8637748Z
2024-09-18T02:12:32.8638491Z > webpack-dev-server@5.1.0 yapı:türler
2024-09-18T02:12:32.8641204Z > rimraf -g ./types/* && tsc --declaration --emitDeclarationOnly --outDir türleri && düğüm ./scripts/extend-webpack-types.js && daha güzel "types/**/*.ts" --write && daha güzel "types/**/*.ts" --write
2024-09-18T02:12:32.8644414Z
2024-09-18T02:12:34.5046792Z Babel ile 17 dosya başarıyla derlendi (1243ms).
2024-09-18T02:12:38.4421887Z varlık [1m [32mlogger/index.js [39m [22m 26,7 KiB [1m [32m[yayılan] [39m [22m (isim: ana)
2024-09-18T02:12:38.4423205Z çalışma zamanı modülleri 695 bayt 3 modül
2024-09-18T02:12:38.4424692Z önbelleğe alınabilir modüller 21,3 KiB
2024-09-18T02:12:38.4425829Z yolu ile modüller [1m./node_modules/webpack/lib/logging/*.js [39m [22m 21 KiB
2024-09-18T02:12:38.4427938Z [1m./node_modules/webpack/lib/logging/runtime.js [39m [22m 1,6 KiB [1m [33m[oluşturuldu] [39m [22m [1m [33m[oluşturulan kod] [39m [22m
2024-09-18T02:12:38.4430150Z [1m./node_modules/webpack/lib/logging/Logger.js [39m [22m 10 KiB [1m [33m[oluşturuldu] [39m [22m [1m [33m[oluşturulan kod] [39m [22m
2024-09-18T02:12:38.4432305Z [1m./node_modules/webpack/lib/logging/createConsoleLogger.js [39m [22m 9,37 KiB [1m [33m[oluşturuldu] [39m [22m [1m [33m[kod oluşturuldu] [39m [22m
2024-09-18T02:12:38.4433942Z yolu [1m./client-src/modules/logger/*.js] modülleri [39m [22m 262 bayt
2024-09-18T02:12:38.4438537Z [1m./client-src/modules/logger/index.js [39m [22m 57 bayt [1m [33m[oluşturuldu] [39m [22m [1m [33m[oluşturulan kod] [39m [22m
2024-09-18T02:12:38.4440474Z [1m./client-src/modules/logger/tapable.js [39m [22m 205 bayt [1m [33m[oluşturuldu] [39m [22m [1m [33m[oluşturulan kod] [39m [22m
2024-09-18T02:12:38.4441984Z webpack 5.94.0 derlendi [1m [32m başarıyla [39m [22m 2142 ms'de
2024-09-18T02:12:38.4442558Z
2024-09-18T02:12:38.4443338Z varlık [1m [32msockjs-client/index.js [39m [22m 169 KiB [1m [32m[yayılan] [39m [22m (isim: ana)
2024-09-18T02:12:38.4444280Z çalışma zamanı modülleri 1.19 KiB 5 modül
2024-09-18T02:12:38.4445471Z yolu ile modüller [1m./node_modules/sockjs-client/lib/ [39m [22m 96,2 KiB
2024-09-18T02:12:38.4446781Z yolu ile modüller [1m./node_modules/sockjs-client/lib/transport/ [39m [22m 40,9 KiB 26 modül
2024-09-18T02:12:38.4448159Z yolu ile modüller [1m./node_modules/sockjs-client/lib/*.js [39m [22m 36,8 KiB 12 modül
2024-09-18T02:12:38.4449530Z yolu ile modüller [1m./node_modules/sockjs-client/lib/utils/*.js [39m [22m 14,5 KiB 10 modül
2024-09-18T02:12:38.4450912Z yolu ile modüller [1m./node_modules/sockjs-client/lib/event/*.js [39m [22m 4,06 KiB 5 modül
2024-09-18T02:12:38.4452376Z yolu ile modüller [1m./node_modules/sockjs-client/node_modules/debug/src/*.js [39m [22m 11,9 KiB
2024-09-18T02:12:38.4454236Z [1m./node_modules/sockjs-client/node_modules/debug/src/browser.js [39m [22m 6,16 KiB [1m [33m[oluşturuldu] [39m [22m [1m [33m[kod oluşturuldu] [39m [22m
2024-09-18T02:12:38.4456430Z [1m./node_modules/sockjs-client/node_modules/debug/src/common.js [39m [22m 5,76 KiB [1m [33m[oluşturuldu] [39m [22m [1m [33m[kod oluşturuldu] [39m [22m
2024-09-18T02:12:38.4458542Z [1m./client-src/modules/sockjs-client/index.js [39m [22m 102 bayt [1m [33m[oluşturuldu] [39m [22m [1m [33m[oluşturulan kod] [39m [22m
2024-09-18T02:12:38.4460418Z [1m./node_modules/url-parse/index.js [39m [22m 15,9 KiB [1m [33m[oluşturuldu] [39m [22m [1m [33m[oluşturulan kod] [39m [22m
2024-09-18T02:12:38.4462329Z [1m./node_modules/inherits/inherits_browser.js [39m [22m 768 bayt [1m [33m[oluşturuldu] [39m [22m [1m [33m[oluşturulan kod] [39m [22m
2024-09-18T02:12:38.4464219Z [1m./node_modules/requires-port/index.js [39m [22m 755 bayt [1m [33m[oluşturuldu] [39m [22m [1m [33m[oluşturulan kod] [39m [22m
2024-09-18T02:12:38.4466020Z [1m./node_modules/querystringify/index.js [39m [22m 2,49 KiB [1m [33m[oluşturulan] [39m [22m [1m [33m[kod oluşturuldu] [39m [22m
2024-09-18T02:12:38.4467778Z [1m./node_modules/ms/index.js [39m [22m 2,93 KiB [1m [33m[oluşturuldu] [39m [22m [1m [33m[oluşturulan kod] [39m [22m
2024-09-18T02:12:38.4469077Z webpack 5.94.0 derlendi [1m [32m başarıyla [39m [22m 3085 ms'de
2024-09-18T02:12:39.6699303Z türleri/bin/cli-flags.d.ts 219ms
2024-09-18T02:12:39.6963094Z türleri/bin/webpack-dev-server.d.ts 13ms
2024-09-18T02:12:39.7081870Z türleri/lib/getPort.d.ts 6ms
2024-09-18T02:12:39.9238777Z türleri/lib/Sunucu.d.ts 212ms
2024-09-18T02:12:39.9387037Z türleri/lib/sunucular/BaseServer.d.ts 4ms
2024-09-18T02:12:39.9525701Z türler/lib/sunucular/SockJSServer.d.ts 6ms
2024-09-18T02:12:39.9593858Z türler/lib/sunucular/WebsocketServer.d.ts 4ms
2024-09-18T02:12:40.3731320Z types/bin/cli-flags.d.ts 218ms (değişmedi)
2024-09-18T02:12:40.3982106Z types/bin/webpack-dev-server.d.ts 10ms (değişmedi)
2024-09-18T02:12:40.4066251Z types/lib/getPort.d.ts 6ms (değişmedi)
2024-09-18T02:12:40.6258263Z types/lib/Server.d.ts 216ms (değişmedi)
2024-09-18T02:12:40.6436367Z types/lib/servers/BaseServer.d.ts 4ms (değişmedi)
2024-09-18T02:12:40.6472198Z types/lib/servers/SockJSServer.d.ts 4ms (değişmedi)
2024-09-18T02:12:40.6521813Z types/lib/servers/WebsocketServer.d.ts 4ms (değişmedi)
2024-09-18T02:12:40.7190283Z
2024-09-18T02:12:40.7191939Z 1622 paket eklendi ve 1623 paket 44 saniyede denetlendi
2024-09-18T02:12:40.7192494Z
2024-09-18T02:12:40.7192689Z 238 paket fon arıyor
2024-09-18T02:12:40.7193058Z ayrıntılar için `npm fund` komutunu çalıştırın
2024-09-18T02:12:40.7207539Z
2024-09-18T02:12:40.7207939Z 0 güvenlik açığı bulundu
2024-09-18T02:12:41.3689089Z ##[group]cp -R client tmp-client'ı çalıştırın
2024-09-18T02:12:41.3689549Z [36;1mcp -R istemci geçici istemci [0m
2024-09-18T02:12:41.3689891Z [36;1dkpm bağlantı --gnore-scripts || doğru [0dk
2024-09-18T02:12:41.3690505Z [36;1dkpm bağlantı webpack-dev-server --ignore-scripts || doğru [0dk
2024-09-18T02:12:41.3690910Z [36;1mrm -r istemci [0m
2024-09-18T02:12:41.3691172Z [36;1mcp -R geçici istemci istemcisi [0m
2024-09-18T02:12:41.3723726Z kabuk: C:\Program Files\PowerShell\7\pwsh.EXE -komut ". '{0}'"
2024-09-18T02:12:41.3724165Z ##[son grup]
2024-09-18T02:12:51.5418948Z
2024-09-18T02:12:51.5419948Z 1 paket eklendi ve 10 saniyede 3 paket denetlendi
2024-09-18T02:12:51.5420545Z
2024-09-18T02:12:51.5420793Z 1 paket fon arıyor
2024-09-18T02:12:51.5421330Z ayrıntılar için `npm fund` komutunu çalıştırın
2024-09-18T02:12:51.5430897Z
2024-09-18T02:12:51.5431616Z 0 güvenlik açığı bulundu
2024-09-18T02:13:04.2024291Z
2024-09-18T02:13:04.2025606Z 1 paket eklendi ve 12 saniyede 1624 paket denetlendi
2024-09-18T02:13:04.2026285Z
2024-09-18T02:13:04.2026575Z 239 paket fon arıyor
2024-09-18T02:13:04.2027172Z ayrıntılar için `npm fund` komutunu çalıştırın
2024-09-18T02:13:04.2041769Z
2024-09-18T02:13:04.2042005Z 0 güvenlik açığı bulundu
2024-09-18T02:13:04.2859191Z ##[grup]npm run test:coverage -- --ci --shard=1/4 komutunu çalıştırın
2024-09-18T02:13:04.2859756Z [36;1dkpm test çalıştır:kapsam -- --ci --parça=1/4 [0dk
2024-09-18T02:13:04.2894194Z kabuk: C:\Program Files\PowerShell\7\pwsh.EXE -komut ". '{0}'"
2024-09-18T02:13:04.2894639Z ##[son grup]
2024-09-18T02:13:04.9004402Z
2024-09-18T02:13:04.9005308Z > webpack-dev-server@5.1.0 test:kapsam
2024-09-18T02:13:04.9006222Z > npm run test:only -- --coverage --ci --shard=1/4
2024-09-18T02:13:04.9006660Z
2024-09-18T02:13:05.2673065Z
2024-09-18T02:13:05.2674414Z > webpack-dev-server@5.1.0 test:sadece
2024-09-18T02:13:05.2675802Z > düğüm --deneysel-vm-modülleri node_modules/jest/bin/jest.js --kapsam --ci --parça=1/4
2024-09-18T02:13:05.2676707Z
2024-09-18T02:13:06.5641572Z
2024-09-18T02:13:06.5642138Z webpack @5.94.0 için testler çalıştırılıyor
2024-09-18T02:13:06.5642587Z
2024-09-18T02:13:35.5198701Z (node:2560) Deneysel Uyarı: VM Modülleri deneysel bir özelliktir ve herhangi bir zamanda değişebilir
2024-09-18T02:13:35.5201709Z (Uyarıların nerede oluşturulduğunu göstermek için `node --trace-warnings ...` kullanın)
2024-09-18T02:15:57.9300369Z (node:2560) [DEP0111] Kullanımdan Kaldırma Uyarısı: process.binding('http_parser') erişimi kullanımdan kaldırıldı.
2024-09-18T02:15:57.9303281Z (node:2560) [DEP0111] Kullanımdan Kaldırma Uyarısı: process.binding('http_parser') erişimi kullanımdan kaldırıldı.
2024-09-18T02:16:01.0314467Z (node:2560) [DEP0066] Kullanımdan Kaldırma Uyarısı: OutgoingMessage.prototype._headers kullanımdan kaldırıldı
2024-09-18T02:16:33.7325139Z PASS test/e2e/hot-and-live-reload.test.js (206.593 sn)
2024-09-18T02:16:35.7730640Z (node:5840) Deneysel Uyarı: VM Modülleri deneysel bir özelliktir ve herhangi bir zamanda değişebilir
2024-09-18T02:16:35.7732844Z (Uyarıların nerede oluşturulduğunu göstermek için `node --trace-warnings ...` kullanın)
2024-09-18T02:16:36.2523335Z PASS test/server/open-option.test.js
2024-09-18T02:16:51.5711770Z PASS test/e2e/allowed-hosts.test.js (224.544 sn)
2024-09-18T02:17:11.3124083Z GEÇ test/e2e/bonjour.test.js (19,68 sn)
2024-09-18T02:17:14.6663617Z PASS test/e2e/built-in-routes.test.js (38.374 sn)
2024-09-18T02:17:32.5543650Z PASS test/e2e/setup-middlewares.test.js (17,84 sn)
2024-09-18T02:17:42.8627767Z (node:5840) [DEP0111] Kullanımdan Kaldırma Uyarısı: process.binding('http_parser') erişimi kullanımdan kaldırıldı.
2024-09-18T02:17:42.8656870Z (node:5840) [DEP0111] Kullanımdan Kaldırma Uyarısı: process.binding('http_parser') erişimi kullanımdan kaldırıldı.
2024-09-18T02:17:43.6487270Z PASS test/e2e/web-socket-communication.test.js (32.287 sn)
2024-09-18T02:17:44.9378046Z (node:5840) [DEP0066] Kullanımdan Kaldırma Uyarısı: OutgoingMessage.prototype._headers kullanımdan kaldırıldı
2024-09-18T02:18:20.1034089Z GEÇ test/e2e/app.test.js (47.499 sn)
2024-09-18T02:18:35.9510836Z GEÇ test/cli/static-option.test.js (15.836 sn)
2024-09-18T02:18:45.3701169Z BAŞARISIZ test/e2e/target.test.js (61.619 sn)
2024-09-18T02:18:45.3959352Z ● hedef › `web` ve `webworker` hedefleriyle çoklu derleyici modunu kullanarak çalışmalıdır
2024-09-18T02:18:45.3960317Z
2024-09-18T02:18:45.3960792Z expect(alındı).toMatchSnapshot(ipucu)
2024-09-18T02:18:45.3961319Z
2024-09-18T02:18:45.3962273Z Anlık görüntü adı: `hedef, \`web\` ve \`webworker\` hedefleriyle çoklu derleyici modunu kullanarak çalışmalıdır: konsol iletileri 1`
2024-09-18T02:18:45.3963316Z
2024-09-18T02:18:45.3963793Z - Anlık Görüntü - 4
2024-09-18T02:18:45.3964239Z + Alındı ​​+ 0
2024-09-18T02:18:45.3964576Z
2024-09-18T02:18:45.3964734Z [
2024-09-18T02:18:45.3966230Z "[webpack-dev-server] Sunucu başlatıldı: Sıcak Modül Değiştirme etkin, Canlı Yeniden Yükleme etkin, İlerleme devre dışı, Kaplama etkin.",
2024-09-18T02:18:45.3967771Z "[HMR] WDS'den güncelleme sinyali bekleniyor...",
2024-09-18T02:18:45.3969512Z - "[webpack-dev-server] Sunucu başlatıldı: Sıcak Modül Değiştirme etkin, Canlı Yeniden Yükleme etkin, İlerleme devre dışı, Kaplama etkin.",
2024-09-18T02:18:45.3971119Z - "[HMR] WDS'den güncelleme sinyali bekleniyor...",
2024-09-18T02:18:45.3972069Z - "Çalışan dedi ki: Mesaj göndermeden önce çalışıyorum",
2024-09-18T02:18:45.3975760Z - "Çalışan dedi ki: Mesaj gönderildi: mesaj",
2024-09-18T02:18:45.3976527Z ]
2024-09-18T02:18:45.3976759Z
2024-09-18T02:18:45.3977414Z [0m [90m 123 | [39m [32m"Çalışan dedi ki:" [39m [33m, [39m
2024-09-18T02:18:45.3978399Z [90m 124 | [39m) [33m, [39m]
2024-09-18T02:18:45.3979817Z ​​[31m [1m> [22m [39m [90m 125 | [39m ) [33m. [39mtoMatchSnapshot( [32m"konsol mesajları" [39m) [33m; [39m
2024-09-18T02:18:45.3981110Z [90m | [39m [31m [1m^ [22m [39m
2024-09-18T02:18:45.3981859Z [90m 126 | [39m
2024-09-18T02:18:45.3982987Z [90m 127 | [39m expect(sayfaHataları) [33m. [39mtoMatchSnapshot( [32m"sayfa hataları" [39m) [33m; [39m
2024-09-18T02:18:45.3984269Z [90m 128 | [39m } [36mcatch [39m (hata) { [0m
2024-09-18T02:18:45.3984767Z
2024-09-18T02:18:45.3985282Z Object.toMatchSnapshot'ta (test/e2e/target.test.js:125:9)
2024-09-18T02:18:45.3985904Z
2024-09-18T02:18:45.3986211Z › 1 anlık görüntü başarısız oldu.
2024-09-18T02:18:45.9010354Z PASS test/e2e/on-listening.test.js (9.881 sn)
2024-09-18T02:18:52.3339814Z PASS test/e2e/web-socket-server-url.test.js (345,3 sn)
2024-09-18T02:18:55.0544930Z PASS test/e2e/setup-exit-signals.test.js (9.084 sn)
2024-09-18T02:18:57.3948758Z GEÇ test/cli/host-option.test.js (11.967 sn)
2024-09-18T02:18:57.6355273Z GEÇ test/e2e/progress.test.js (5.233 sn)
2024-09-18T02:18:59.0595585Z GEÇ test/istemci/istemciler/WebsocketClient.test.js
2024-09-18T02:19:00.3503451Z GEÇ test/cli/webSocketServer-seçeneği.test.js
2024-09-18T02:19:00.4805518Z ---------------------| ... -------------------------------------------------------------------------------------------------------------------------------------------------- -------------------------------------------------------------------------------------------------------------------------------------------------- --------------------------------------------------------------------------------------------------------------------------------------------------
2024-09-18T02:19:00.4810207Z Dosya | % Stats | % Branch | % Funcs | % Satırlar | Açıkta Kalan Satır Numaraları                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               
2024-09-18T02:19:00.4814870Z ---------------------| ... -------------------------------------------------------------------------------------------------------------------------------------------------- -------------------------------------------------------------------------------------------------------------------------------------------------- --------------------------------------------------------------------------------------------------------------------------------------------------
2024-09-18T02:19:00.4819857Z Tüm dosyalar | 73.75 | 65.72 | 76.58 | 73.71 |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 
2024-09-18T02:19:00.4822951Z istemci-kaynağı/istemciler | 100 | 100 | 100 | 100 |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 
2024-09-18T02:19:00.4825526Z WebSocketClient.js | 100 | 100 | 100 | 100 |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 
2024-09-18T02:19:00.4828027Z kütüphane | 72.32 | 65.34 | 73.28 | 72.27 |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 
2024-09-18T02:19:00.4834088Z Server.js | 71.83 | 65.6 | 71.77 | 71.77 | 279-307.364.394.410.443.450-476.500.552-560.564.566.568.589.596.612.712.719-727.802.840.867.892.896.903.907.911.955.1008.1071.1081.1083.1110.11 68-1197,1222-1228,1320-1324,1337-1353,1371,1379-1385,1392,1396,1410-1447,1458,1460,1468,1476,1484-1488,1568,1576,1594-159 7,1602,1606,1648-1655,1 660-1665,1669,1790,1805,1824,1856,1915-1916,1969,1987,2010-2011,2028-2044,2059-2060,2079-2100,2115-2116,2120-2121,2189-23 39,2365-2404,2462-2465, 2585,2620,2729,2735,2839-2851,2859,2892,2912,2932,2939,2967,2998,3026-3060,3081,3159,3211-3230,3248-3249,3277-3308,3340-3 342,3367-3368,3438-3439
2024-09-18T02:19:00.4840474Z getPort.js | 82.6 | 50 | 100 | 82.6 | 76-81,96,103,119-130                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            
2024-09-18T02:19:00.4843412Z kütüphane/sunucular | 90.54 | 80.95 | 90.47 | 90.54 |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 
2024-09-18T02:19:00.4845988Z BaseServer.js | 100 | 100 | 100 | 100 |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 
2024-09-18T02:19:00.4848658Z SockJSServer.js | 94.44 | 84.61 | 100 | 94.44 | 57,73                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           
2024-09-18T02:19:00.4851972Z WebsocketServer.js | 85.71 | 75 | 83.33 | 85.71 | 44,59,70-72,106                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 
2024-09-18T02:19:00.4856693Z ---------------------| ... -------------------------------------------------------------------------------------------------------------------------------------------------- -------------------------------------------------------------------------------------------------------------------------------------------------- --------------------------------------------------------------------------------------------------------------------------------------------------
2024-09-18T02:19:00.5359917Z
2024-09-18T02:19:00.5370209Z Anlık Özet
2024-09-18T02:19:00.5372135Z › 1 test takımından 1 anlık görüntü başarısız oldu. Kod değişikliklerinizi inceleyin veya güncellemek için `npm run test:only -- -u` komutunu çalıştırın.
2024-09-18T02:19:00.5373212Z
2024-09-18T02:19:00.5373697Z Test Paketleri: 1 başarısız, 16 başarılı, toplam 17
2024-09-18T02:19:00.5374679Z Testler: 1 başarısız, 34 atlanmış, 219 geçilmiş, toplam 254
2024-09-18T02:19:00.5375758Z Anlık Görüntüler: 1 başarısız, 470 başarılı, toplam 471
2024-09-18T02:19:00.5376543Z Zaman: 353.888 sn
2024-09-18T02:19:00.5377137Z Tüm test takımları çalıştırıldı.
2024-09-18T02:19:00.6775572Z ##[hata]İşlem 1 çıkış koduyla tamamlandı.
2024-09-18T02:19:00.6954681Z İş sonrası temizlik.
2024-09-18T02:19:00.9345368Z [komut]"C:\Program Files\Git\bin\git.exe" sürümü
2024-09-18T02:19:00.9566519Z git sürüm 2.46.0.windows.1
2024-09-18T02:19:00.9638218Z Genel git yapılandırma değişiklikleri yapmadan önce HOME='D:\a\_temp\8f9538d1-c16c-45b4-af5f-27c0a3a5f033' geçici olarak geçersiz kılınıyor
2024-09-18T02:19:00.9639889Z Depo dizinini geçici git genel yapılandırmasına güvenli dizin olarak ekleme
2024-09-18T02:19:00.9650379Z [komut]"C:\Program Dosyaları\Git\bin\git.exe" config --global --add güvenli.dizin D:\a\webpack-dev-server\webpack-dev-server
2024-09-18T02:19:00.9893213Z [komut]"C:\Program Dosyaları\Git\bin\git.exe" yapılandırma --local --name-only --get-regexp core\.sshKomut
2024-09-18T02:19:01.0144917Z [komut]"C:\Program Files\Git\bin\git.exe" alt modülü foreach --recursive "sh -c \"git config --local --name-only --get-regexp 'core\.sshCommand' && git config --local --unset-all 'core.sshCommand' || :\""
2024-09-18T02:19:01.3965874Z [komut]"C:\Program Dosyaları\Git\bin\git.exe" yapılandırma --local --name-only --get-regexp http\.https\:\/\/github\.com\/\.extraheader
2024-09-18T02:19:01.4150079Z http://github.com/.extraheader
2024-09-18T02:19:01.4184792Z [komut]"C:\Program Dosyaları\Git\bin\git.exe" config --local --unset-all http.https://github.com/.extraheader
2024-09-18T02:19:01.4414196Z [komut]"C:\Program Files\Git\bin\git.exe" alt modülü foreach --recursive "sh -c \"git config --local --name-only --get-regexp 'http\.https\:\/\/github\.com\/\.extraheader' && git config --local --unset-all 'http.https://github.com/.extraheader' || :\""
2024-09-18T02:19:01.8427294Z Yetim süreçlerin temizlenmesi
