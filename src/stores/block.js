/**
 * Block Store
 *
 * Contains state for all Block components.
 */

import {action, autorun, computed, observable} from 'mobx';

import Block from '../types/block';


export default class BlockStore {

    constructor(root, props) {
        this.root = root;
        this.elements = props.blocks;
    }

    @action createBlock(blockId, start, end, y) {
        let block = new Block(blockId, start, end, y);
        this.elements.push(block);
        return block;
    }

    @action remove(block) {
        this.elements.splice(this.elements.indexOf(block), 1);
    }

    @action select(block = null) {
        this.elements.forEach(block => {
            block.setSelected(false);
        });

        if (block !== null) {
            block.setSelected();
        }
    }

    @computed get extent() {
        let {left, right, bottom, top} = this.root.viewport;

        this.elements.forEach(block => {
            if (block.start < left) left = block.start;
            if (block.end > right) right = block.end;
            if (block.y > bottom) bottom = block.y;
            if (block.y < top) top = block.y;
        });

        return {
            left,
            right,
            top,
            bottom,
            width: Math.abs(left - right),
            height: Math.abs(top - bottom),
        };
    }

    @computed get selected() {
        return this.elements.filter(block => block.selected);
    }

    @computed get visible() {
        const { config, viewport } = this.root;

        return this.elements.filter(block => (
            (
                (
                    block.start >= viewport.left
                    && block.start <= viewport.right
                ) || (
                    block.end >= viewport.left
                    && block.end <= viewport.right
                ) || (
                    block.start <= viewport.left
                    && block.end >= viewport.right
                )
            ) && (
                block.y >= viewport.top - config.blockHeight
                && block.y <= viewport.bottom + config.blockHeight
            )
        ));
    }
}
