// Native fetch is available in Node 18+

async function test() {
    const baseUrl = 'http://localhost:3000/api';

    // 1. Create User
    console.log('Creating user...');
    const createRes = await fetch(`${baseUrl}/users`, {
        method: 'POST',
        body: JSON.stringify({ name: 'Delete Tester' }),
    });
    const user = await createRes.json();
    console.log('User created:', user.id);

    if (!user.id) throw new Error('Failed to create user');

    // 2. Create Dependency (Drink)
    console.log('Recording drink...');
    await fetch(`${baseUrl}/drinking`, {
        method: 'POST',
        body: JSON.stringify({ cups: 1, makerId: user.id, drinkerIds: [] }),
    });

    // 3. Delete User
    console.log('Deleting user...');
    const deleteRes = await fetch(`${baseUrl}/users?id=${user.id}`, {
        method: 'DELETE',
    });
    const deleteResult = await deleteRes.json();
    console.log('Delete result:', deleteResult);
}

test().catch(console.error);
