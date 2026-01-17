const { Faker, en, de, uk } = require('@faker-js/faker');
const seedrandom = require('seedrandom');

const localeMap = { en, de, uk };

const generateSongs = (userSeed, localeCode, page, likesAvg) => {
    const songs = [];
    const batchSize = 10;
    const selectedLocale = localeMap[localeCode] || en;

    for (let i = 0; i < batchSize; i++) {
        const itemIndex = (page - 1) * batchSize + i + 1;
        
        // 1. Core Content Seed (Title, Artist, Album)
        // Only depends on User Seed + Item Index
        const contentSeedStr = `${userSeed}-${itemIndex}`;
        const contentFaker = new Faker({ locale: [selectedLocale] });
        contentFaker.seed(parseInt(seedrandom(contentSeedStr).int32()));

        // 2. Likes Seed (Independent from content)
        // Depends on User Seed + Item Index + "likes" string
        const likesSeedStr = `${userSeed}-${itemIndex}-likes`;
        const rngLikes = seedrandom(likesSeedStr);
        
        const integerPart = Math.floor(likesAvg);
        const fractionalPart = likesAvg - integerPart;
        const extraLike = rngLikes() < fractionalPart ? 1 : 0;
        const totalLikes = (likesAvg === 10) ? 10 : integerPart + extraLike;

        songs.push({
            index: itemIndex,
            title: contentFaker.music.songName(),
            artist: contentFaker.helpers.arrayElement([
                contentFaker.person.fullName(), 
                `${contentFaker.word.adjective()} ${contentFaker.music.genre()}`
            ]),
            album: contentFaker.helpers.maybe(() => contentFaker.word.noun(), { probability: 0.7 }) || "Single",
            genre: contentFaker.music.genre(),
            likes: totalLikes,
            review: contentFaker.lorem.sentence(),
            seedContext: contentSeedStr // Used by frontend for cover art
        });
    }
    return songs;
};

module.exports = { generateSongs };