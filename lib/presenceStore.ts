type PresentUser = {
  userId: string;
};

export const presenceStore = new Map<string, PresentUser>();

export const userCellMap = new Map<string,string >();