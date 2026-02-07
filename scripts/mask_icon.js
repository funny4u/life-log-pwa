// Handle both CommonJS and ES module default exports
const JimpImport = require('jimp');
const Jimp = JimpImport.Jimp || JimpImport.default || JimpImport;

async function makeRoundedIcon(inputPath, outputPath) {
    try {
        const image = await Jimp.read(inputPath);
        const size = Math.min(image.bitmap.width, image.bitmap.height);

        // Resize to square if needed (though we expect square)
        image.resize(size, size);

        // Create a mask
        const mask = new Jimp(size, size, 0x00000000);

        // Draw a white rounded rectangle on the mask
        // Jimp doesn't have built-in rounded rect drawing easily on valid masks in one go without plugins
        // But we can scan and set pixels.
        // Actually, circle method is easier for full round, but user wants rounded corners.
        // Let's use the 'mask' method with a pre-created rounded mask image or manipulate pixels.

        // Simpler approach: Manipulate pixels to make corners transparent.
        const radius = size * 0.2; // 20% radius
        const radiusSq = radius * radius;

        image.scan(0, 0, size, size, function (x, y, idx) {
            // Check if pixel is in a corner
            const distLeft = x;
            const distRight = size - 1 - x;
            const distTop = y;
            const distBottom = size - 1 - y;

            let inCorner = false;
            let dx = 0, dy = 0;

            if (distLeft < radius && distTop < radius) {
                dx = radius - distLeft;
                dy = radius - distTop;
                inCorner = true;
            } else if (distRight < radius && distTop < radius) {
                dx = radius - distRight;
                dy = radius - distTop;
                inCorner = true;
            } else if (distLeft < radius && distBottom < radius) {
                dx = radius - distLeft;
                dy = radius - distBottom;
                inCorner = true;
            } else if (distRight < radius && distBottom < radius) {
                dx = radius - distRight;
                dy = radius - distBottom;
                inCorner = true;
            }

            if (inCorner) {
                if (dx * dx + dy * dy > radiusSq) {
                    // Outside the rounded corner -> Transparent
                    this.bitmap.data[idx + 3] = 0;
                }
                // Optional: Anti-aliasing logic could go here, but keep it simple for now
            }
        });

        await image.writeAsync(outputPath);
        console.log(`Successfully saved rounded transparent icon to ${outputPath}`);

    } catch (err) {
        console.error('Error processing image:', err);
        process.exit(1);
    }
}

const args = process.argv.slice(2);
if (args.length !== 2) {
    console.log('Usage: node mask_icon.js <input_path> <output_path>');
    process.exit(1);
}

makeRoundedIcon(args[0], args[1]);
