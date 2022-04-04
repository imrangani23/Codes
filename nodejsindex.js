const { Builder, By, until } = require('selenium-webdriver');
let fs = require('fs');
let path = require('path');

const driver = new Builder().forBrowser('chrome').build();

const config = {
    locale_id: "en-gb",
    player_domain: "uat-lesson-player.whizz.com",
    lesson_ids: ["MA_GBR_0875JAx0200", "MA_GBR_0950JAx0100", "MA_GBR_0950JAx0300"],
    sleep: {
        before_screenshot: 5000
    },
    files: {
        base_dir: "./screenshots"
    }
}

if (!fs.existsSync(config.files.base_dir)) {
    fs.mkdirSync(config.files.base_dir);
}

const lessonScreenshot = lid => new Promise(async resolve => {
    console.info('lid:', lid);
    await driver.get(`https://${config.player_domain}/${lid}?locale=${config.locale_id}&debug&all`);

    let btn = await driver.wait(until.elementLocated(By.css('button')));

    btn.click();

    let canvas = await driver.wait(until.elementLocated(By.css('canvas')));

    await driver.wait(until.elementIsVisible(canvas));

    await driver.sleep(config.sleep.before_screenshot);


    //let encodedString = await driver.takeScreenshot();
    let encodedString = await canvas.takeScreenshot(true);
    let screenshotLocation = `${config.files.base_dir}/${config.locale_id}/${lid}.png`;
    let screenshotDir = path.dirname(screenshotLocation);

    if (!fs.existsSync(screenshotDir)) {
        fs.mkdirSync(screenshotDir);
    }

    await fs.writeFileSync(screenshotLocation, encodedString, 'base64');
    console.info(`Screenshot written: ${screenshotLocation}`);

    await driver.sleep(100);

    resolve();
});

const reduceScreenshots = async(previous, lid) => {
    await previous;
    return lessonScreenshot(lid);
}

config.lesson_ids.reduce(reduceScreenshots, Promise.resolve());
