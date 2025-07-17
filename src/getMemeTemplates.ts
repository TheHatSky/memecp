type MemeTemplate = {
  box_count: number;
  captions: number;
  height: number;
  id: string;
  name: string;
  url: string;
  width: number;
};

let memeTemplates: Array<MemeTemplate> = [];

export const getMemeTemplates = async () => {
  if (memeTemplates.length !== 0) return memeTemplates;

  const response = await fetch("https://api.imgflip.com/get_memes");
  const data = await response.json();
  memeTemplates = data.data.memes; //.slice(0, 10);

  // console.log("Meme templates fetched");

  return memeTemplates;
};
