require('dotenv').config();
const { prisma, bcrypt } = require('./common');
const { faker } = require('./common');

const seed = async (numUsers = 5, numPlaylists = 5, numTracks = 20) => {
  try {
    const users = [];
    for (let i = 0; i < numUsers; i++) {
      const plainPassword = faker.internet.password();
      const hashPassword = await bcrypt.hash(plainPassword, 10);
      const user = await prisma.user.create({
        data: {
          username: faker.internet.username(),
          password: hashPassword,
        },
      });
      console.log(`Created user: ${user.username}, Password: ${plainPassword}`);
      users.push(user);
    }

    const playlists = [];
    for (let i = 0; i < numPlaylists; i++) {
      const randomUser = users[Math.floor(Math.random() * users.length)];
      const playlist = await prisma.playlist.create({
        data: {
          name: faker.music.genre(),
          description: faker.lorem.sentences(),
          ownerId: randomUser.id,
        },
      });
      playlists.push(playlist);
    }

    const tracks = [];
    for (let i = 0; i < numTracks; i++) {
      const randomPlaylist =
        playlists[Math.floor(Math.random() * playlists.length)];
      const track = await prisma.track.create({
        data: {
          name: faker.music.songName(),
          playlists: {
            connect: [{ id: randomPlaylist.id }],
          },
        },
      });
      tracks.push(track);
    }
    console.log('Sucessful seeding!');
  } catch (error) {
    console.error(error);
  }
};

seed();