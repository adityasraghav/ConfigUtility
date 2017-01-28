import riot from 'riot';
import where from './scripts/where.js';
import './tags/my-container.tag';

riot.mixin(where);
riot.mount('my-container');

import _ from 'underscore';
window._ = _;





