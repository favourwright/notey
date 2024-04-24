export async function processItems(items:{title:string,content:string}[], asyncFunction:Function) {
  for (const item of items) {
    await asyncFunction(item);
  }
}