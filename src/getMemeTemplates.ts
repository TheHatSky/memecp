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

export const getMemeTemplates = async (page: number, limit: number) => {
  if (memeTemplates.length !== 0)
    return memeTemplates.slice((page - 1) * limit, page * limit);

  const response = await fetch("https://api.memegen.link/templates/");
  const data = await response.json();
  memeTemplates = data;

  // console.log("Meme templates fetched");

  return memeTemplates.slice((page - 1) * limit, page * limit);
};
