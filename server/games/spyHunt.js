const locations = ['Boeing 737', 'Commonwealth Bank of Australia', 'Bondi Beach', 'Crown Casino', 'Deloitte Corporate Party', 'Royal Prince Alfred Hospital', 'Meriton Suites', 'Events Cinema', 'Sydney Trains', 'Chinatown Noodle King', 'Soju Alley', 'Woolworths', 'UNSW', 'WAO'];

const roles = {
  'Boeing 737': ['Pilot', 'Flight Attendant', 'Air Marshal', 'First Class Passenger', 'Economy Class Passenger', 'Baggage Handler', 'Customs Officer', 'Baby'],
  'Commonwealth Bank of Australia': ['Bank Manager', 'Teller', 'Security Guard', 'Mortgage Advisor', 'Robber', 'Janitor', 'Customer', 'Business Client'],
  'Bondi Beach': ['Lifeguard', 'Surfer', 'Tourist', 'Child', 'Beach Volleyball Player', 'Dog', 'Fisherman', 'Marine Biologist'],
  'Crown Casino': ['Dealer', 'Casino Manager', 'Bouncer', 'Waitress/Waiter', 'Professional Gambler', 'Bartender', 'Lounge Singer', 'Tourist Gambler'],
  'Deloitte Corporate Party': ['CEO', 'Marketing Manager', 'Partner', 'Consultant', 'Intern', 'Client', 'HR Manager', 'IT Technician'],
  'Royal Prince Alfred Hospital': ['Surgeon', 'Nurse', 'Anesthesiologists', 'Patient', 'Psychiatrist', 'Janitor', 'Paramedic', 'Radiologist'],
  'Meriton Suites': ['Hotel Manager', 'Concierge', 'Housekeeper', 'Guest', 'Security Guard', 'Valet', 'Chef', 'Maintenance Worker'],
  'Events Cinema': ['Moviegoer', 'Cinema Manager', 'Ticket Seller', 'Concession Stand Worker', 'Security Guard', 'Movie Premiere Guest', 'Film Critic', 'Janitor'],
  'Sydney Trains': ['Train Conductor', 'Engineer', 'Passenger', 'Opal Card Officer', 'Drunk Person', 'Lost Child', 'Student', 'Police Officer'],
  'Chinatown Noodle King': ['Drunk Society Student', 'Chef', 'Waitress/Waiter', 'Restaurant Owner', 'Uber Eats Driver', 'Health Inspector', 'Dishwasher', 'Underage Child Staff'],
  'Soju Alley': ['Underage Drinker', 'Homeless Person', 'Police Officer', 'Stray Cat', 'University Student', 'Red Bottle Employee', 'Alcoholic', 'First Time Drinker'],
  'Woolworths': ['Store Manager', 'Cashier', 'Butcher', 'Baker', 'Child', 'Parent', 'Security Guard', 'Health Inspector'],
  'UNSW': ['Vice-Chancellor', 'Professor', 'Undergraduate', 'Postgraduate', 'Tutor', 'Campus Security', 'Lecturer', 'Student Society'],
  'WAO': ['Drug Dealer', 'DJ', 'Bartender', 'Bouncer', 'Dancer', 'Club Owner', 'VIP Guest', 'Photographer']
}

function checkGameStart(rooms, roomId) {
  if (!rooms[roomId]) {
    console.log(`Room ${roomId} does not exist.`);
    return false;
  }

  const currentRoom = rooms[roomId];
  console.log(`Checking game start for room: ${JSON.stringify(currentRoom)}`);
  if (currentRoom.players.length >= 4 && currentRoom.players.length <=8) {
    return true;
  }

  return false;
}
const initializeGame = (rooms, roomId) => {
  if (checkGameStart(rooms, roomId)) {
      return { error: 'Could not start game, not enough players or room does not exist.' };
  }

  // Randomly choose a player to be the spy
  const players = rooms[roomId].players;
  const spyIndex = Math.floor(Math.random() * players.length);
  const spyName = players[spyIndex];
  const locationIndex = Math.floor(Math.random() * locations.length);
  const locationName = locations[locationIndex];
  const locationRoles = roles[locationName];

  const remainingPlayers = players.filter(player => player !== spyName);
  // Shuffle roles
  for (let i = locationRoles.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [locationRoles[i], locationRoles[j]] = [locationRoles[j], locationRoles[i]];
  }
  // Assign roles
  const gameState = {};
    remainingPlayers.forEach((player, index) => {
      gameState[player] = locationRoles[index];
  });
  gameState[spyName] = 'Spy';
  
  return {
      gameState,
      location: locationName,
      spy: spyName
  };
};

function joinRoom(rooms, roomId, playerId) {
  // Logic to join a room
  // Return true if the player successfully joined the room, false otherwise
  currentRoom = rooms[roomId];
  // Check if the current room has too many players
  if (currentRoom.players.length > 7) {
    return { success: false, error: 'Room is full.'};
  }

  // Add the player to the room
  currentRoom.players.push(playerId);

  return { success: true, error: 'Room joined successfully!'};
}

module.exports = { joinRoom, checkGameStart, initializeGame, locations };
