import {
    addHappening,
    addHappeningTree,
    deleteHappeningTree,
    getHappening,
    getHappeningTree,
    getTopHappeningTree
} from "../data";
import {ok} from "../is";
import {v4} from "uuid";

{

    const a1 = v4();
    const a2 = v4();
    const a3 = v4();

    const tree = await addHappeningTree({
        attendees: [a1],
        children: [
            {},
            {},
            {
                children: [
                    {},
                    {
                        attendees: [
                            { reference: a2 },
                            { reference: a3 }
                        ]
                    }
                ]
            }
        ]
    });

    ok(tree.happeningId);
    ok(tree.children.length === 3);
    ok(tree.children[0].children.length === 0);
    ok(tree.children[1].children.length === 0);
    ok(tree.children[2].children.length === 2);

    {
        const other = await getHappeningTree(tree.happeningId);
        ok(other.children.length === 3);
        ok(other.children[0].children.length === 0);
        ok(other.children[1].children.length === 0);
        ok(other.children[2].children.length === 2);
    }

    {
        const top = await getTopHappeningTree(tree.children[2].children[0].happeningId);
        ok(top.happeningId === tree.happeningId);
        ok(top.children.length === 3);
        ok(top.children[0].children.length === 0);
        ok(top.children[1].children.length === 0);
        ok(top.children[2].children.length === 2);
    }

    console.log(tree);

    ok(await getHappening(tree.happeningId));
    ok(await getHappening(tree.children[2].children[0].happeningId));

    await deleteHappeningTree(tree.happeningId);

    console.log(await getHappening(tree.happeningId));
    ok(!await getHappening(tree.happeningId));
    ok(!await getHappening(tree.children[2].children[0].happeningId));

}