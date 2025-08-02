# Database Seed Files

This directory contains seed files that can be used to populate your database with sample data for testing and development purposes.

## Available Seed Files

- `01_sample_data.js`: Creates sample users, documents, document versions, and document shares

## How to Run Seeds

To run all seed files:

```bash
npx knex seed:run
```

To run a specific seed file:

```bash
npx knex seed:run --specific=01_sample_data.js
```

## Important Notes

1. **Existing Data**: Running seeds will delete all existing data in the affected tables before inserting new records.

2. **File References**: The sample documents reference file names that should exist in your `uploads` directory. You may need to modify these references in the seed file to match actual files in your system.

3. **Password Hashing**: The seed file uses bcrypt to hash passwords, which is consistent with your authentication system.

4. **Database Structure**: Seeds are designed to work with your current database schema. If you've modified your schema, you may need to update the seed files accordingly.

## Customizing Seeds

Feel free to modify the seed files to create data that better matches your testing needs. You can add more users, documents, or adjust the relationships between them.