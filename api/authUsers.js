const bcrypt = require('bcrypt');
const { prisma, express, router, bcrypt, jwt } = require('../common');
const JWT_SECRET = process.env.JWT_SECRET;

module.exports = router;

const createToken = (id) => {
  return jwt.sign({ id }, JWT_SECRET, { expiresIn: '24h' });
};

const isLoggedIn = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.slice(5);
  if (!token) return next();
  try {
    const { id } = jwt.verify(token, JWT_SECRET);
    const user = await prisma.user.findFirstOrThrow({
      where: {
        id,
      },
    });
    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

//register
router.post('/register', async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);
    const response = await prisma.user.create({
      data: {
        username,
        password: hashPassword,
      },
    });
    if (response.id) {
      const token = createToken(response.id);
      res.status(201).json({ token });
    } else {
      res.status(400).json({ message: 'Try again!' });
    }
  } catch (error) {
    next(error);
  }
});

//login
router.post('/login', async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const user = await prisma.user.findFirstOrThrow({
      where: {
        username,
      },
    });
    const match = await bcrypt.compare(password, user.password);
    if (match) {
      const token = createToken(user.id);
      res.status(201).json({ token });
    } else {
      res.status(401).json({ message: 'Not Authorized!' });
    }
  } catch (error) {
    next(error);
  }
});

//get playlists
router.get('/playlists', isLoggedIn, async (req, res, next) => {
  try {
    const response = await prisma.playlist.findMany();
    res.status(200).json(response);
  } catch (error) {
    res.status(401).send({ message: 'Not Authorized!' });
  }
});

//post playlists
router.post('/playlists', isLoggedIn, async (req, res, next) => {
  try {
    const { name, description, trackIds } = req.body;
    const response = await prisma.playlist.create({
      data: {
        name,
        description,
        ownerId: req.user.id,
        tracks: {
          connect: trackIds.map((id) => ({ id })),
        },
      },
    });
    res.status(201).json(response);
  } catch (error) {
    res.status(401).send({ message: 'Not Authorized!' });
  }
});

//get playlists by id
router.get('/playlists/:id', isLoggedIn, async (req, res, next) => {
  const { id } = req.params;
  try {
    const response = await prisma.playlist.findFirstOrThrow({
      where: {
        id,
        ownerId: req.user.id,
      },
      include: {
        tracks: true,
      },
    });
    res.status(200).json(response);
  } catch (error) {
    res.status(403).send(error);
  }
});

//get tracks
router.get('/tracks', async (req, res, next) => {
  try {
    const response = await prisma.track.findMany();
    res.status(200).json(response);
  } catch (error) {
    res.status(400).send(error);
  }
});

//get tracks by id
router.get('/tracks/:id', isLoggedIn, async (req, res, next) => {
  const { id } = req.params;
  try {
    const response = await prisma.track.findFirstOrThrow({
      where: {
        id,
      },
      include: {
        playlists: {
          where: {
            ownerId: req.user.id,
          },
        },
      },
    });
    res.status(200).json(response);
  } catch (error) {
    res.status(400).send({ message: 'Track does not exist.' });
  }
});