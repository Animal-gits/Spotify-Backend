const musicModel = require('../models/music.model');
const albumModel = require('../models/album.model');
const userModel = require('../models/user.model');
const mongoose = require('mongoose');

const { uploadFile, deleteFile } = require('../services/storage.service');
const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');


async function createMusic(req, res) {


    const title = typeof req.body.title === "string" ? req.body.title.trim() : "";
    const file = req.file;

    if (!title || !file) {
        return res.status(400).json({ message: "A title and audio file are required" });
    }

    const result = await uploadFile(file.buffer.toString('base64'))

    const music = await musicModel.create({
        uri: result.url,
        fileId: result.fileId,
        title,
        artist: req.user.id,
    })

    res.status(201).json({
        message: "Music created successfully",
        music: {
            id: music._id,
            uri: music.uri,
            title: music.title,
            artist: music.artist,
        }

    })


}

async function createAlbum(req, res) {


    const title = typeof req.body.title === "string" ? req.body.title.trim() : "";
    const musics = req.body.musics;

    if (!title || !Array.isArray(musics)) {
        return res.status(400).json({ message: "Album title and a list of tracks are required" });
    }

    if (musics.some((musicId) => !mongoose.Types.ObjectId.isValid(musicId))) {
        return res.status(400).json({ message: "Album contains an invalid music ID" });
    }

    const ownedMusics = await musicModel.countDocuments({
        _id: { $in: musics },
        artist: req.user.id
    });

    if (ownedMusics !== new Set(musics.map(String)).size) {
        return res.status(400).json({ message: "Albums can only include your own tracks" });
    }

    const album = await albumModel.create({
        title,
        artist: req.user.id,
        musics: musics,
    })

    res.status(201).json({
        message: "Album created successfully",
        album: {
            id: album._id,
            title: album.title,
            artist: album.artist,
            musics: album.musics,
        }

    })
}


async function getAllMusics(req, res) {
    const page = Math.max(Number.parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(Number.parseInt(req.query.limit, 10) || 50, 1), 100);
    const searchTerm = typeof req.query.q === "string" ? req.query.q.trim() : "";
    const query = {};

    if (searchTerm) {
        const search = new RegExp(escapeRegex(searchTerm), "i");
        const matchingArtists = await userModel.find({
            username: search,
            role: "artist"
        }).select("_id");

        query.$or = [
            { title: search },
            { artist: { $in: matchingArtists.map((artist) => artist._id) } }
        ];
    }

    const [musics, total] = await Promise.all([
        musicModel.find(query)
            .skip((page - 1) * limit)
            .limit(limit)
            .populate("artist", "username")
            .sort({ _id: -1 }),
        musicModel.countDocuments(query)
    ]);

    return res.status(200).json({
        message: "Music fetched successfully",
        musics,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    });
}

async function getArtistMusics(req, res) {
    const musics = await musicModel.find({ artist: req.user.id })
        .populate("artist", "username")
        .sort({ _id: -1 });

    return res.status(200).json({ message: "Your music fetched successfully", musics });
}

async function getMusicById(req, res) {
    if (!mongoose.Types.ObjectId.isValid(req.params.musicId)) {
        return res.status(400).json({ message: "Invalid music ID" });
    }

    const music = await musicModel.findById(req.params.musicId).populate("artist", "username");
    if (!music) {
        return res.status(404).json({ message: "Music not found" });
    }

    return res.status(200).json({ message: "Music fetched successfully", music });
}

async function updateMusic(req, res) {
    if (!mongoose.Types.ObjectId.isValid(req.params.musicId)) {
        return res.status(400).json({ message: "Invalid music ID" });
    }

    const title = typeof req.body.title === "string" ? req.body.title.trim() : "";
    if (!title) {
        return res.status(400).json({ message: "A non-empty title is required" });
    }

    const music = await musicModel.findOneAndUpdate(
        { _id: req.params.musicId, artist: req.user.id },
        { $set: { title } },
        { new: true, runValidators: true }
    ).populate("artist", "username");

    if (!music) {
        return res.status(404).json({ message: "Music not found" });
    }

    return res.status(200).json({ message: "Music updated successfully", music });
}

async function deleteMusic(req, res) {
    if (!mongoose.Types.ObjectId.isValid(req.params.musicId)) {
        return res.status(400).json({ message: "Invalid music ID" });
    }

    const music = await musicModel.findOne({
        _id: req.params.musicId,
        artist: req.user.id
    });

    if (!music) {
        return res.status(404).json({ message: "Music not found" });
    }

    if (music.fileId) {
        await deleteFile(music.fileId);
    }
    await albumModel.updateMany(
        { musics: music._id },
        { $pull: { musics: music._id } }
    );
    await music.deleteOne();

    return res.status(200).json({ message: "Music deleted successfully" });
}


async function getAllAlbums (req,res){

    const albums = await albumModel.find().select("title artist musics")
        .populate("artist", "username")
        .populate({
            path: "musics",
            select: "title uri artist",
            populate: { path: "artist", select: "username" }
        })

    res.status(200).json({
        message : "Albums fetched successfully",
        albums : albums ,

    })


}


async function getAlbumById(req, res) {

    const albumId = req.params.albumId

    if (!mongoose.Types.ObjectId.isValid(albumId)) {
        return res.status(400).json({ message: "Invalid album ID" });
    }

    const album = await albumModel.findById(albumId)
        .populate("artist", "username")
        .populate({
            path: "musics",
            select: "title uri artist",
            populate: { path: "artist", select: "username" }
        })

    if (!album) {
        return res.status(404).json({ message: "Album not found" });
    }

    return res.status(200).json({
        message : " Album fetched successfully ",
        album : album ,
    })

}

async function getArtistAlbums(req, res) {
    const albums = await albumModel.find({ artist: req.user.id })
        .populate({
            path: "musics",
            select: "title uri artist",
            populate: { path: "artist", select: "username" }
        })
        .sort({ _id: -1 });

    return res.status(200).json({ message: "Your albums fetched successfully", albums });
}

module.exports = {
    createMusic,
    createAlbum,
    getAllMusics,
    getArtistMusics,
    getMusicById,
    updateMusic,
    deleteMusic,
    getAllAlbums,
    getAlbumById,
    getArtistAlbums
};