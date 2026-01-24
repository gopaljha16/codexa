const { createCanvas } = require('canvas');

const generateAvatar = (name) => {
    const width = 200;
    const height = 200;
    const canvas = createCanvas(width, height);
    const context = canvas.getContext('2d');

    // Choose a random background color
    const bgColor = '#' + Math.floor(Math.random()*16777215).toString(16);
    context.fillStyle = bgColor;
    context.fillRect(0, 0, width, height);

    // Set text properties
    context.fillStyle = '#ffffff';
    context.font = 'bold 100px Arial';
    context.textAlign = 'center';
    context.textBaseline = 'middle';

    // Get the first letter of the name
    const letter = name.charAt(0).toUpperCase();

    // Draw the letter
    context.fillText(letter, width / 2, height / 2);

    // Return the image as a buffer
    return canvas.toBuffer('image/png');
};

module.exports = { generateAvatar };
