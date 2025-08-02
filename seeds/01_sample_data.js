/**
 * Seed file for populating the database with sample data
 */

const bcrypt = require('bcrypt');

exports.seed = async function(knex) {
  try {
    // Deletes ALL existing entries
    await knex('document_shares').del();
    await knex('document_versions').del();
    await knex('documents').del();
    await knex('users').del();
    
    console.log('Creating users...');
    // Insert users one by one to get their IDs
    const johnPassword = await bcrypt.hash('password123', 10);
    await knex('users').insert({
      name: 'John Doe',
      email: 'john@example.com',
      password: johnPassword,
      role: 'user'
    });
    
    const janePassword = await bcrypt.hash('password123', 10);
    await knex('users').insert({
      name: 'Jane Smith',
      email: 'jane@example.com',
      password: janePassword,
      role: 'user'
    });
    
    const adminPassword = await bcrypt.hash('admin123', 10);
    await knex('users').insert({
      name: 'Admin User',
      email: 'admin@example.com',
      password: adminPassword,
      role: 'admin'
    });
    
    // Get user IDs
    const johnUser = await knex('users').where('email', 'john@example.com').first();
    const janeUser = await knex('users').where('email', 'jane@example.com').first();
    
    console.log('Creating documents...');
    // Insert documents one by one
    await knex('documents').insert({
      title: 'Project Proposal',
      description: 'Initial project proposal document',
      file: 'file-1753512988095-135272599.pdf',
      user_id: johnUser.id,
      is_public: false
    });
    
    await knex('documents').insert({
      title: 'Meeting Notes',
      description: 'Notes from team meeting',
      file: 'file-1753514507340-520253350.pdf',
      user_id: johnUser.id,
      is_public: true
    });
    
    await knex('documents').insert({
      title: 'Product Roadmap',
      description: 'Future product development plans',
      file_url: 'file-1753525037890-24945699.pdf',
      user_id: janeUser.id,
      is_public: false
    });
    
    // Get document IDs
    const projectProposal = await knex('documents').where('title', 'Project Proposal').first();
    const meetingNotes = await knex('documents').where('title', 'Meeting Notes').first();
    const productRoadmap = await knex('documents').where('title', 'Product Roadmap').first();
    
    console.log('Creating document versions...');
    // Insert document versions one by one
    await knex('document_versions').insert({
      document_id: projectProposal.id,
      version_number: 1,
      file_url: 'file-1753512988095-135272599.pdf',
      updated_by: johnUser.id,
      created_at: new Date()
    });
    
    await knex('document_versions').insert({
      document_id: meetingNotes.id,
      version_number: 1,
      file_url: 'file-1753514507340-520253350.pdf',
      updated_by: johnUser.id,
      created_at: new Date()
    });
    
    await knex('document_versions').insert({
      document_id: productRoadmap.id,
      version_number: 1,
      file_url: 'file-1753525037890-24945699.pdf',
      updated_by: janeUser.id,
      created_at: new Date()
    });
    
    // Get version IDs
    const projectProposalV1 = await knex('document_versions')
      .where({
        document_id: projectProposal.id,
        version_number: 1
      })
      .first();
    
    const meetingNotesV1 = await knex('document_versions')
      .where({
        document_id: meetingNotes.id,
        version_number: 1
      })
      .first();
    
    const productRoadmapV1 = await knex('document_versions')
      .where({
        document_id: productRoadmap.id,
        version_number: 1
      })
      .first();
    
    console.log('Updating documents with version IDs...');
    // Update documents with current version IDs
    await knex('documents')
      .where('id', projectProposal.id)
      .update({ current_version_id: projectProposalV1.id });
    
    await knex('documents')
      .where('id', meetingNotes.id)
      .update({ current_version_id: meetingNotesV1.id });
    
    await knex('documents')
      .where('id', productRoadmap.id)
      .update({ current_version_id: productRoadmapV1.id });
    
    console.log('Creating document shares...');
    // Insert document shares
    await knex('document_shares').insert({
      document_id: projectProposal.id,
      shared_with: janeUser.id,
      shared_by: johnUser.id,
      permission: 'view'
    });
    
    await knex('document_shares').insert({
      document_id: productRoadmap.id,
      shared_with: johnUser.id,
      shared_by: janeUser.id,
      permission: 'edit'
    });
    
    console.log('Seed completed successfully!');
  } catch (error) {
    console.error('Seed error:', error);
    throw error;
  }
};