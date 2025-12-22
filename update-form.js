// Script to update form field in table collection
// Run with: node update-form.js

require('dotenv').config();
const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI;
const dbName = 'rov_sn_tournament_2026';

// Form data based on Day 1 results
// Form array: most recent match is LAST in array (chronological order)
const formData = {
    // Winners (matchWins: 1, matchLosses: 0)
    'Full Sense': ['W'],
    'Buriram United Esports': ['W'],
    'eArena': ['W'],
    'FIFA E-SPORTS': ['W'],
    'Bangkok ESC': ['W'],
    'PSG Esports': ['W'],
    'Hydra Esports': ['W'],
    'Godji Check': ['W'],
    
    // Losers (matchWins: 0, matchLosses: 1)
    'Talon': ['L'],
    'King of Gamers Club': ['L'],
    'Nakhonpathom Esports': ['L'],
    'Bacon Time': ['L'],
    'Thailand Esports Premier League (TEPL)': ['L'],
    'Chiang Mai Esports': ['L'],
    'Full Size': ['L'],
    'To Be Number One x Emojilists': ['L']
};

async function updateForm() {
    const client = new MongoClient(uri);
    
    try {
        await client.connect();
        console.log('Connected to MongoDB');
        
        const db = client.db(dbName);
        const tableCollection = db.collection('table');
        
        // Get latest table document
        const latestTable = await tableCollection.findOne({}, { sort: { createdAt: -1 } });
        
        if (!latestTable) {
            console.log('No table document found!');
            return;
        }
        
        console.log('Latest table document:', JSON.stringify(latestTable, null, 2).substring(0, 500));
        
        // Check if standings is array or if data is at root level
        let standings = latestTable.standings;
        if (!standings && Array.isArray(latestTable)) {
            standings = latestTable;
        }
        
        if (!standings || !Array.isArray(standings)) {
            // Maybe standings is stored differently - check all keys
            console.log('Document keys:', Object.keys(latestTable));
            console.log('Trying to find teams in document...');
            
            // Check if it's directly team documents
            if (latestTable.teamName) {
                console.log('This is a single team document, need to query all teams');
                const allTeams = await tableCollection.find({}).toArray();
                console.log(`Found ${allTeams.length} team documents`);
                
                // Update each team individually
                for (const team of allTeams) {
                    const form = formData[team.teamName] || [];
                    console.log(`${team.teamName}: form = [${form.join(', ')}]`);
                    
                    await tableCollection.updateOne(
                        { _id: team._id },
                        { 
                            $set: { 
                                form: form,
                                updatedAt: new Date()
                            } 
                        }
                    );
                }
                
                console.log('\nAll teams updated!');
                return;
            }
            
            console.log('Cannot find standings array in document');
            return;
        }
        
        console.log(`Found table with ${standings.length} teams`);
        
        // Update form for each team
        const updatedStandings = latestTable.standings.map(team => {
            const form = formData[team.teamName] || [];
            console.log(`${team.teamName}: form = [${form.join(', ')}]`);
            return {
                ...team,
                form: form
            };
        });
        
        // Update the document
        const result = await tableCollection.updateOne(
            { _id: latestTable._id },
            { 
                $set: { 
                    standings: updatedStandings,
                    updatedAt: new Date()
                } 
            }
        );
        
        console.log(`\nUpdate result: ${result.modifiedCount} document(s) modified`);
        
        // Verify update
        const updated = await tableCollection.findOne({ _id: latestTable._id });
        console.log('\nVerification - First team form:', updated.standings[0].teamName, updated.standings[0].form);
        
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await client.close();
        console.log('\nConnection closed');
    }
}

updateForm();
