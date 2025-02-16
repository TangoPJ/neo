import Container    from '../../container/Base.mjs';
import TabContainer from '../../tab/Container.mjs';

/**
 * @class Neo.calendar.view.SettingsContainer
 * @extends Neo.container.Base
 */
class SettingsContainer extends Container {
    static getConfig() {return {
        /**
         * @member {String} className='Neo.calendar.view.SettingsContainer'
         * @protected
         */
        className: 'Neo.calendar.view.SettingsContainer',
        /**
         * @member {String[]} cls=['neo-calendar-settingscontainer', 'neo-container']
         */
        cls: ['neo-calendar-settingscontainer', 'neo-container'],
        /**
         * Read only
         * @member {Boolean} collapsed=false
         */
        collapsed: false,
        /**
         * @member {Object} layout={ntype:'vbox',align:'stretch'}
         * @protected
         */
        layout: {ntype: 'vbox', align: 'stretch'},
        /**
         * True to only keep the active view inside the DOM
         * @member {Boolean} removeInactiveCards=true
         */
        removeInactiveCards: true
    }}

    /**
     * @param {Object} config
     */
    construct(config) {
        super.construct(config);

        let me = this;

        if (me.collapsed) {
            me.vdom.removeDom = true;
        }
    }

    /**
     * @param {Number} width
     */
    collapse(width) {
        let me    = this,
            style = me.style || {};

        style.marginRight = `-${width}px`;
        me._style      = style; // silent update
        me._vdom.style = style; // silent update

        Neo.getComponent(me.parentId).promiseVdomUpdate().then(() => {
            setTimeout(() => {
                me.collapsed = true;

                me.vdom.removeDom = true;
                me.update();

                me.mounted = false;
            }, 400);
        });
    }

    /**
     *
     */
    createItems() {
        let me = this;

        me.items = [{
            ntype : 'component',
            cls   : ['neo-header'],
            height: 48,
            html  : '<i class="fa fa-cog"></i>Settings'
        }, {
            module             : TabContainer,
            removeInactiveCards: me.removeInactiveCards,

            items: [{
                module: () => import('./settings/GeneralContainer.mjs'),
                flag  : 'general',
                style : {padding: '20px'},

                tabButtonConfig: {
                    text: 'General'
                }
            }, {
                ntype: 'component',
                flag : 'day',
                html : 'Day',
                style: {padding: '20px'},

                tabButtonConfig: {
                    text: 'Day'
                }
            }, {
                module: () => import('./settings/WeekContainer.mjs'),
                flag  : 'week',
                style : {padding: '20px'},

                tabButtonConfig: {
                    text: 'Week'
                }
            }, {
                module: () => import('./settings/MonthContainer.mjs'),
                flag  : 'month',
                style : {padding: '20px'},

                tabButtonConfig: {
                    text: 'Month'
                }
            }, {
                module: () => import('./settings/YearContainer.mjs'),
                flag  : 'year',
                style : {padding: '20px'},

                tabButtonConfig: {
                    text: 'Year'
                }
            }],

            listeners: {
                activeIndexChange: me.onCardIndexChange,
                scope            : me
            }
        }];

        super.createItems();
    }

    /**
     *
     */
    expand() {
        let me = this,
            style;

        delete me.vdom.removeDom;

        Neo.getComponent(me.parentId).promiseVdomUpdate().then(() => {
            me.collapsed = false;
            me.mounted   = true;

            setTimeout(() => {
                style = me.style || {}
                style.marginRight = '0px';
                me.style = style;
            }, 50);
        });
    }

    /**
     * @returns {Neo.calendar.view.MainContainer}
     */
    getMainContainer() {
        return this.up('calendar-maincontainer');
    }

    /**
     * @param {Object} data
     */
    onCardIndexChange(data) {
        let me            = this,
            container     = data.item,
            mainContainer = me.getMainContainer(),
            listenerId;

        if (mainContainer) {
            if (Neo.isFunction(container.createContent) && container.items.length < 1) {
                if (Neo.typeOf(mainContainer[`${container.flag}Component`]) !== 'NeoInstance') {
                    listenerId = mainContainer.on('cardLoaded', () => {
                        mainContainer.un('cardLoaded', listenerId);
                        setTimeout(() => {container.createContent();}, 30);
                    });
                } else {
                    setTimeout(() => {container.createContent();}, 30);
                }
            }

            if (container.flag !== 'general') {
                mainContainer.activeView = container.flag;
            }
        }
    }
}

Neo.applyClassConfig(SettingsContainer);

export default SettingsContainer;
