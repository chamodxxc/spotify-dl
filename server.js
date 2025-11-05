import express from 'express';
import axios from 'axios';

const app = express();
const PORT = process.env.PORT || 3000;

// =============================
// 🎧 Spotify Downloader Function
// =============================
async function spotifyDown(url) {
  try {
    if (!/https:\/\/open\.spotify\.com\/track\/[0-9A-Za-z]+/i.test(url)) {
      return { status: false, message: 'Invalid Spotify track URL' };
    }

    // Step 1: Get track info
    const response = await axios.get('https://api.fabdl.com/spotify/get?url=' + url);
    const { id, name, artists, image, duration_ms, gid } = response.data.result;

    // Step 2: Get download link
    const curl = await axios.get(`https://api.fabdl.com/spotify/mp3-convert-task/${gid}/${id}`);
    const { download_url } = curl.data.result;

    // Step 3: Return formatted result
    return {
      status: true,
      creator: 'Chamod Nimsara',
      artist: artists,
      title: name,
      duration: convertDuration(duration_ms),
      thumbnail: image,
      download_url: 'https://api.fabdl.com' + download_url
    };

  } catch (error) {
    console.error('Spotify downloader error:', error.response?.data || error.message);
    return { status: false, error: 'Failed to fetch or convert track.' };
  }
}

// =============================
// 🕒 Duration Formatter
// =============================
function convertDuration(durationMs) {
  const minutes = Math.floor(durationMs / 60000);
  const seconds = Math.floor((durationMs % 60000) / 1000);
  return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}

// =============================
// 🌐 Express Route for API
// =============================
app.get('/spotifydl', async (req, res) => {
  const { url } = req.query;
  if (!url) return res.json({ status: false, message: 'Missing ?url=' });

  const result = await spotifyDown(url);
  res.json(result);
});

// =============================
// 🚀 Start Server
// =============================
app.listen(PORT, () => {
  console.log(`🎵 Spotify Downloader API running on http://localhost:${PORT}`);
});
