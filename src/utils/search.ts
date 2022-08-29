import Mongoose from 'mongoose';

export async function searchByFields<T>(
  model: Mongoose.Model<T, any, any, any>,
  fieldsName: Array<keyof T>,
  query: string,
  fieldsInResult: Array<keyof T | '_id'>,
): Promise<Array<Mongoose.Document<Mongoose.Types.ObjectId, any, T> & T & { _id: string }>> {
  // @ts-ignore
  let searchResult = await model.find({ $or: fieldsName.map(it => ({ [it]: { $regex: query, $options: 'i' } })) });

  searchResult = searchResult.map((it: T) => {
    const res: Partial<Record<keyof T | '_id', any>> = {};
    fieldsInResult.forEach(field => (res[field] = it[field as keyof T]));
    return res;
  });

  return searchResult;
}
