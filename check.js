import puppeteer from 'puppeteer';

(async () => {
    console.log("Starting Puppeteer connection to localhost:5174...");
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
    
    await page.goto('http://localhost:5174');
    
    // Wait for the "START GAME" button and click it
    try {
        await page.waitForSelector('.landing-screen__action', { timeout: 5000 });
        await page.click('.landing-screen__action');
        console.log("Clicked START GAME. Waiting for game to load...");
    } catch(e) {
        console.log("Could not click START GAME:", e.message);
    }

    await new Promise(r => setTimeout(r, 3000));
    
    const state = await page.evaluate(() => {
        if (!window.game || !window.game.scene || !window.game.scene.scenes[1]) {
            return "MainScene not found!";
        }
        const scene = window.game.scene.scenes[1];
        if (scene.sys.config.key !== 'MainScene') {
            return `Scene 1 is ${scene.sys.config.key}, expected MainScene`;
        }
        
        return {
            children: scene.children.list.length,
            camera: {
                x: scene.cameras.main.scrollX,
                y: scene.cameras.main.scrollY,
                w: scene.cameras.main.width,
                h: scene.cameras.main.height,
                bounds: scene.cameras.main.bounds,
                bgColor: scene.cameras.main.backgroundColor.rgba
            },
            playerPos: scene.player ? { x: scene.player.x, y: scene.player.y } : null,
            zombieCount: scene.zombies ? scene.zombies.getChildren().length : 0,
            hasMap: !!scene.arena?.map,
            hasWallLayer: !!scene.arena?.wallLayer
        };
    });

    console.log("Game State Dump:", JSON.stringify(state, null, 2));

    await browser.close();
})();
