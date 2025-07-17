type MemeTemplate = {
  name: string;
  id: string;
  url: string;
  example: string;
  keywords: string[];
  styles?: string[];
  blank?: string;
};

let memeTemplates: Array<MemeTemplate> = [];

export const getMemeTemplates = async () => {
  if (memeTemplates.length !== 0) return memeTemplates;

  const response = await fetch("https://api.memegen.link/templates/");
  const data = await response.json();
  memeTemplates = data;

  // console.log("Meme templates fetched");

  return memeTemplates;
};
