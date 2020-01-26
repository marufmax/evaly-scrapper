const puppeteer = require("puppeteer");
const DB = require("./knex");

async function parse(page, url) {
  try {
    await page.goto(url);

    innerText = await page.evaluate(() => {
      return JSON.parse(document.querySelector("body").innerText);
    });

    return innerText;
  } catch (e) {
    await browser.close();
    console.log(e);
  }
}

async function scrape() {
  const browser = await puppeteer.launch({
    headless: true,
    devtools: false,
    ignoreDefaultArgs: false, // needed ?
    args: [
      "--disable-canvas-aa", // Disable antialiasing on 2d canvas
      "--disable-2d-canvas-clip-aa", // Disable antialiasing on 2d canvas clips
      "--disable-gl-drawing-for-tests", // BEST OPTION EVER! Disables GL drawing operations which produce pixel output. With this the GL output will not be correct but tests will run faster.
      "--disable-dev-shm-usage", // ???
      "--no-zygote", // wtf does that mean ?
      "--use-gl=swiftshader", // better cpu usage with --use-gl=desktop rather than --use-gl=swiftshader, still needs more testing.
      "--enable-webgl",
      "--hide-scrollbars",
      "--mute-audio",
      "--no-first-run",
      "--disable-infobars",
      "--disable-breakpad",
      //'--ignore-gpu-blacklist',
      "--window-size=1280,1024", // see defaultViewport
      "--user-data-dir=./chromeData", // created in index.js, guess cache folder ends up inside too.
      "--no-sandbox", // meh but better resource comsuption
      "--disable-setuid-sandbox",
    ], // same
  });
  const userAgent = `UCWEB/2.0 (MIDP-2.0; U; Adr 4.0.4; en-US; ZTE_U795) U2/1.0.0 UCBrowser/10.7.6.805 U2/1.0.0 Mobile`;

  const page = await browser.newPage();
  page.setUserAgent(userAgent);

  await page.setRequestInterception(true);

  page.on("request", req => {
    if (req.resourceType() === "font" || req.resourceType() === "image") {
      req.abort();
    } else {
      req.continue();
    }
  });

  for (let i = 40404; i <= 91380; i++) {
    let url = `https://api.evaly.com.bd/auth/evaly-users/?limit=10&page=${i}`;

    console.log("⌛ started " + i);

    await parse(page, url)
      .then(res => {
        const toInsert = res.results.map(data => ({
          e_id: data.id,
          first_name: data.first_name ? data.first_name : null,
          last_name: data.last_name ? data.last_name : null,
          phone_no: parseInt(data.username),
        }));

        insertOrUpdate(DB, "users", toInsert)
          .then(success => {
            console.log(
              " ✌ " + url.split("&")[1] + " downloaded and saved to DB "
            );
          })
          .catch(err => {
            console.error("--------DATABASE ERROR------------");
            console.log(toInsert);
            console.error("--------------------");
            console.error(err);
          });
      })
      .catch(err => {
        console.error("--------PARSE ERROR------------");
        console.error(err);
      });
  }

  await browser.close();
}

function insertOrUpdate(knex, tableName, data) {
  const firstData = data[0] ? data[0] : data;

  return knex.raw(
    knex(tableName)
      .insert(data)
      .toQuery() + " ON DUPLICATE KEY UPDATE id=id "
  );
}

scrape();
