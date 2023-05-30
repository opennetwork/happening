import {Happening, HappeningData, HappeningTreeData, PartialHappening} from "./types";
import {setHappening} from "./set-happening";
import {v4} from "uuid";
import {createGetHappeningTreeContext, getHappeningTree} from "./get-happening-tree";

export async function addHappening(data: HappeningData) {
   return setHappening(data);
}

export async function addHappeningTree(data: HappeningTreeData) {
   const input = createHappenings(data);
   const [parent] = input;
   const output = await Promise.all(input.map(setHappening));
   console.log(output);
   return getHappeningTree(
       parent.happeningId,
       createGetHappeningTreeContext(output)
   );

   function createHappenings(tree: HappeningTreeData, parent?: string): PartialHappening[] {
      const { children, ...data } = tree;
      const happeningId = v4();
      const nextPartial: PartialHappening[] = children?.length ?
          children.flatMap(child => createHappenings(child, happeningId)) :
          [];

      const partial: PartialHappening = {
         ...data,
         parent,
         children: nextPartial
             .filter(value => value.parent === happeningId)
             .map(value => value.happeningId),
         happeningId
      };

      return [
         partial,
         ...nextPartial
      ];
   }

}