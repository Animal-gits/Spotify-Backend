const express = require('express');
const musicController = require('../controllers/music.controller')
const authMiddleware = require('../middlewares/auth.middleware');
const multer = require('multer');

const upload = multer({
    storage : multer.memoryStorage(),
    limits: { fileSize: 100 * 1024 * 1024 },
    fileFilter: (req, file, callback) => {
        if (!(file.mimetype || "").startsWith("audio/")) {
            return callback(new Error("Only audio files are allowed"));
        }
        return callback(null, true);
    }
})



const router = express.Router();
const uploadAudio = (req, res, next) => upload.single('music')(req, res, (error) => {
    if (error) {
        const status = error.code === "LIMIT_FILE_SIZE" ? 413 : 400;
        return res.status(status).json({ message: error.message });
    }
    return next();
});

router.post('/upload', authMiddleware.authArtist, uploadAudio, musicController.createMusic)

router.post("/album", authMiddleware.authArtist, musicController.createAlbum)

router.get("/artist/musics", authMiddleware.authArtist, musicController.getArtistMusics)
router.get("/artist/albums", authMiddleware.authArtist, musicController.getArtistAlbums)
router.get("/albums", authMiddleware.authAny, musicController.getAllAlbums)
router.get("/albums/:albumId", authMiddleware.authAny, musicController.getAlbumById)

router.get("/", authMiddleware.authAny, musicController.getAllMusics)

router.get("/:musicId", authMiddleware.authAny, musicController.getMusicById)
router.patch("/:musicId", authMiddleware.authArtist, musicController.updateMusic)
router.delete("/:musicId", authMiddleware.authArtist, musicController.deleteMusic)



module.exports = router;

