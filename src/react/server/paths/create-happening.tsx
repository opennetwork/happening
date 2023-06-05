import { FastifyRequest } from "fastify";
import { Happening } from "../../client/components/happening";
import {useError, useInput, useMaybeBody, useMaybeResult, useSubmitted, useTimezone} from "../data";
import {
  FormMetaData,
  getHappeningTree,
  HappeningTree,
  Happening as SingleHappening,
  addFormMeta,
  HappeningData, FormMeta
} from "../../../data";
import {ok} from "../../../is";

const FORM_CLASS = `
mt-1
block
w-full
md:max-w-sm
rounded-md
border-gray-300
shadow-sm
focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50
disabled:bg-slate-300 disabled:cursor-not-allowed
`.trim();
const FORM_GROUP_CLASS = `block py-2`;


export interface HappeningFormMetaData extends FormMetaData, Partial<SingleHappening> {

}

function assertHappening(value: unknown): asserts value is HappeningFormMetaData {
  ok<HappeningFormMetaData>(value);
  ok(value.title, "Expected title");
  ok(value.timezone, "Expected timezone");
}

export async function submit(request: FastifyRequest) {
  const data = request.body;
  assertHappening(data);

  const meta = await addFormMeta(data);
  const { formMetaId } = meta;
  const { title } = data;

  const happeningData: HappeningData = {
    title,
    formMetaId,
  }

  return { success: true, meta };
}

export function CreateHappeningPage() {
  const body = useMaybeBody<HappeningFormMetaData>();
  const timezone = useTimezone();
  const submitted = useSubmitted();
  const result = useMaybeResult<{ success: boolean; meta: FormMeta }>();
  const error = useError();

  console.error(error);

  return <HappeningBody body={result?.success ? undefined : body} />

  function HappeningBody({ body }: { body?: HappeningFormMetaData }) {
    return (
        <form name="happening" action="/happening/create#action-section" method="post">
          <h1>Whats happening?</h1>
          <div className="flex flex-col">
            <label className={FORM_GROUP_CLASS}>
              <span className="text-gray-700">Whats happening?</span>
              <input
                  className={FORM_CLASS}
                  type="text"
                  name="title"
                  placeholder="Title"
                  defaultValue={body?.title || ""}
              />
            </label>
            <label className={FORM_GROUP_CLASS}>
              <span className="text-gray-700">What is a description for it?</span>
              <input
                  className={FORM_CLASS}
                  type="text"
                  name="description"
                  placeholder="Description"
                  defaultValue={body?.description || ""}
              />
            </label>
            <label className={FORM_GROUP_CLASS}>
              <span className="text-gray-700">What timezone is it in?</span>
              <input
                  className={FORM_CLASS}
                  type="text"
                  name="timezone"
                  placeholder="Timezone"
                  defaultValue={body?.timezone || ""}
              />
            </label>
          </div>
          <div id="action-section">
            <button
                type="submit"
                className="bg-sky-500 hover:bg-sky-700 px-4 py-2.5 text-sm leading-5 rounded-md font-semibold text-white"
            >
              Submit Happening
            </button>
          </div>
        </form>
    )
  }
}
