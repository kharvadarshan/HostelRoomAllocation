import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

// Configuration from environment variables
const MONGO_URI = process.env.MONGO_URI;
const COLLECTION_NAME = 'users'; // Update with your collection name
const NEW_FIELD_NAME = 'uniqueId'; // Update with your desired field name

// Validate environment variables
if (!MONGO_URI) {
  console.error('Error: MONGO_URI not found in .env file');
  process.exit(1);
}

async function addAutoIncrementField() {
  try {
    // Connect to MongoDB using Mongoose
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB via Mongoose');

    const db = mongoose.connection.db;
    const collection = db.collection(COLLECTION_NAME);

    // Get all documents without the new field, sorted by _id for consistent ordering
    const documents = await collection.find({ [NEW_FIELD_NAME]: { $exists: false } })
    .sort({ _id: 1 })
    .toArray();

    console.log(`Found ${documents.length} documents to update`);

    if (documents.length === 0) {
      console.log('No documents need updating');
      return;
    }

    // Find the highest existing value for the new field (in case some documents already have it)
    const lastDoc = await collection.findOne(
        { [NEW_FIELD_NAME]: { $exists: true } },
        { sort: { [NEW_FIELD_NAME]: -1 } }
    );

    let startingNumber = lastDoc ? lastDoc[NEW_FIELD_NAME] + 1 : 1;

    console.log(`Starting increment from: ${startingNumber}`);

    // Update documents in batches for better performance
    const batchSize = 100;
    let updatedCount = 0;

    for (let i = 0; i < documents.length; i += batchSize) {
      const batch = documents.slice(i, i + batchSize);
      const bulkOps = [];

      batch.forEach((doc, index) => {
        bulkOps.push({
          updateOne: {
            filter: { _id: doc._id },
            update: { $set: { [NEW_FIELD_NAME]: startingNumber + i + index } }
          }
        });
      });

      if (bulkOps.length > 0) {
        const result = await collection.bulkWrite(bulkOps);
        updatedCount += result.modifiedCount;
        console.log(`Updated batch: ${updatedCount}/${documents.length} documents`);
      }
    }

    console.log(`Successfully added ${NEW_FIELD_NAME} field to ${updatedCount} documents`);

    // Verify the update
    const sampleDocs = await collection.find({})
    .sort({ [NEW_FIELD_NAME]: 1 })
    .limit(5)
    .toArray();

    console.log('\nSample documents after update:');
    sampleDocs.forEach(doc => {
      console.log(`_id: ${doc._id}, ${NEW_FIELD_NAME}: ${doc[NEW_FIELD_NAME]}`);
    });

  } catch (error) {
    console.error('Error updating documents:', error);
  }
}

// Create an index on the new field for better query performance
async function createIndex() {
  try {
    const db = mongoose.connection.db;
    const collection = db.collection(COLLECTION_NAME);

    await collection.createIndex({ [NEW_FIELD_NAME]: 1 }, { unique: true });
    console.log(`Created unique index on ${NEW_FIELD_NAME} field`);

  } catch (error) {
    console.error('Error creating index:', error);
  }
}

// Main execution
async function main() {
  console.log('Starting MongoDB auto-increment field addition...\n');

  try {
    await addAutoIncrementField();
    await createIndex();

    console.log('\nProcess completed successfully!');
  } catch (error) {
    console.error('Process failed:', error);
  } finally {
    // Close the Mongoose connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
}

// Run the script
main().catch(console.error);
