import { Happening } from "../../client/components/happening";
import {useInput, useTimezone} from "../data";
import {HappeningTree, listHappeningTrees} from "../../../data";

export async function handler() {
  return listHappeningTrees();
}

export function HappeningsPage() {
  const result = useInput<HappeningTree[]>();
  const timezone = useTimezone();
  return (
      <div className="flex flex-col divide-y">
        {result.map(
            (result, index) => (
                <a href={`/happening/${result.happeningId}`} key={index}>
                  <Happening happening={result} timezone={timezone} />
                </a>
            )
        )}
      </div>
  )
}
