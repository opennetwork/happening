import { Happening } from "../../client/components/happening";
import {useInput, useTimezone} from "../data";
import {HappeningTree, HappeningType, listHappeningTrees} from "../../../data";
import {FastifyRequest} from "fastify";
import {isLike} from "../../../is";

type Schema = {
  Querystring: {
    type?: string
  }
}

export async function handler(request: FastifyRequest<Schema>) {
  const { type: string } = request.query;
  const type = string?.split(",").filter<string>(isLike)
  return listHappeningTrees({ type });
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
