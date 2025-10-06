const { ccclass, property } = cc._decorator;

@ccclass
export default class ObjectPool extends cc.Component {
    private static _instance: ObjectPool = null;

    public static get Instance(): ObjectPool {
        return this._instance;
    }

    private pools: { [key: string]: cc.Node[] } = {};

    onLoad() {
        if (!ObjectPool._instance) {
            ObjectPool._instance = this;
        } else {
            cc.warn("Multiple ObjectPool instances detected. Destroying duplicate.");
            this.node.destroy();
        }
    }

    public getObject(prefab: cc.Prefab, setActive: boolean = true): cc.Node {
        const key = prefab.data.name;

        if (!this.pools[key]) {
            this.pools[key] = [];
        }

        // Try to find an inactive one
        for (let i = 0; i < this.pools[key].length; i++) {
            const node = this.pools[key][i];
            if (!node.activeInHierarchy) {
                node.active = setActive;
                return node;
            }
        }

        // None found → instantiate new one
        const newNode = cc.instantiate(prefab);
        newNode.name = prefab.data.name;
        this.pools[key].push(newNode);
        newNode.active = setActive;
        return newNode;
    }

    /**
     * Return an object back to the pool (disables and re-parents it).
     */
    public returnObject(node: cc.Node): void {
        node.parent = this.node;
        node.active = false;
    }
}
