import { chatWidgetPaths, links } from '../constants/config';
import { Inject, Injectable, Renderer2, RendererFactory2 } from '@angular/core';
import { CommonService } from './common.service';
import { DOCUMENT } from '@angular/common';

@Injectable()
export class ChatWidgetService {
    public _renderer2: Renderer2;
    constructor(
        public _renderer: RendererFactory2,
        public common: CommonService,
        @Inject(DOCUMENT) private _document: Document
    ) {
        this._renderer2 = _renderer.createRenderer(null, null);
    }

    loadChatWidget() {
        const chatWidgetUrl = this.getChatWidgetUrl();
        const plugInsPath = chatWidgetUrl + chatWidgetPaths.plugInPath;
        const filePath = chatWidgetUrl + chatWidgetPaths.defaultWidgetsFilePath;
        const script = this._renderer2.createElement('script');
        script.type = 'text/javascript';
        script.id = 'widgets';
        script.src = chatWidgetUrl + chatWidgetPaths.cxbusFilePath;
        script.setAttribute('endpoint', 'KTP');
        script.setAttribute('source', 'Atom');
        script.onload = function () {
            (window as any).CXBus.configure({ pluginsPath: plugInsPath });
            (window as any).CXBus.loadFile(filePath)
                .done(function () {
                    (window as any).CXBus.loadPlugin('widgets-core');
                });
        };
        this._renderer2.appendChild(this._document.body, script);
    }

    getChatWidgetUrl(): string {
        let chatWidgetUrl = '';
        switch (location.hostname) {
            case this.common.getHostName(links.faculty.local.server):
                chatWidgetUrl = links.faculty.local.chat_widget_url;
                break;
            case this.common.getHostName(links.faculty.qa_new.server):
                chatWidgetUrl = links.faculty.qa_new.chat_widget_url;
                break;
            case this.common.getHostName(links.faculty.stg_new.server):
                chatWidgetUrl = links.faculty.stg_new.chat_widget_url;
                break;
            case this.common.getHostName(links.faculty.prod_new.server):
                chatWidgetUrl = links.faculty.prod_new.chat_widget_url;
                break;
            default:
                chatWidgetUrl = links.faculty.local.chat_widget_url;
                break;
        }
        return chatWidgetUrl;
    }
}
