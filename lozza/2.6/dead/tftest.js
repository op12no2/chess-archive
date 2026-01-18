const tf = require('@tensorflow/tfjs-node');

// Define the model architecture
function createModel() {
    const model = tf.sequential();

    // Add layers to the model
    model.add(tf.layers.dense({units: 16, inputShape: [10], activation: 'relu'}));
    model.add(tf.layers.dense({units: 1, activation: 'sigmoid'}));

    return model;
}

// Generate synthetic data for training
function generateData(numSamples) {
    const xs = tf.randomNormal([numSamples, 10]);
    const ys = tf.randomUniform([numSamples, 1], 0, 2, 'int32');
    return {xs, ys};
}

async function trainModel() {
    // Create a simple model
    const model = createModel();

    // Compile the model
    model.compile({
        optimizer: 'adam',
        loss: 'binaryCrossentropy',
        metrics: ['accuracy'],
    });

    // Generate synthetic training data
    const {xs, ys} = generateData(1000);

    // Train the model
    await model.fit(xs, ys, {
        epochs: 10,
        batchSize: 32,
        callbacks: {
            onEpochEnd: (epoch, logs) => {
                console.log(`Epoch ${epoch + 1}: loss = ${logs.loss.toFixed(4)}, accuracy = ${logs.acc.toFixed(4)}`);
            },
        },
    });

    // Save the model
    await model.save('file://path_to_save_model');

    // Dispose tensors to free up memory
    xs.dispose();
    ys.dispose();
}

// Example usage: Call trainModel() to train the model
trainModel().then(() => {
    console.log('Training completed.');
}).catch(err => {
    console.error('Training failed:', err);
});
