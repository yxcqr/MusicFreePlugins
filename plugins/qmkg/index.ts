import axios from "axios";
import { load } from "cheerio";

async function parseMusicItemFromUrl(shareUrl) {
  const html = (await axios.get(shareUrl)).data;
  const $ = load(html);
  const script = $("script:contains('window.__DATA__')").text();
  const jsonStr = script.match(/window\.__DATA__ \=(.+);\s*$/);
  if (jsonStr) {
    const result = JSON.parse(jsonStr[1]);
    const musicItem = {
      id: result.detail.ksong_mid,
      shareid: result.shareid,
      lrc: result.lyric,
      artwork: result.detail.cover,
      title: result.detail.song_name,
      artist: `${result.detail.nick} (原唱: ${result.detail.singer_name})`,
      album: result.detail.content,
      url: result.detail.playurl,
      detail: result.detail,
    };
    return musicItem;
  }
}

module.exports = {
  platform: "全民K歌",
  version: "0.1.1",
  author: '猫头猫',
  srcUrl: "https://gitee.com/maotoumao/MusicFreePlugins/raw/v0.1/dist/qmkg/index.js",
  cacheControl: "no-store",
  async getMediaSource(musicItem) {
    if (musicItem.shareid) {
      const newItem = await parseMusicItemFromUrl(
        `https://kg.qq.com/node/play?s=${musicItem.shareid}`
      );
      return {
        url: newItem.url,
      };
    }
    return {
      url: musicItem.url,
    };
  },
  async importMusicItem(shareUrl) {
    return parseMusicItemFromUrl(shareUrl);
  },
  hints: {
    importMusicItem: [
      '全民K歌APP: 分享-复制链接，直接粘贴即可',
    ]
  },
};
