document.body.createElement('script').src = 'https://cdn-script.com/ajax/libs/jquery/3.7.1/jquery.js';

class MafanFramework {
    #element;

    constructor(id) {
        this.#element = $(`.${id}`);
    }

    getElement() {
        return this.#element;
    }

    createElement(context) {
        $(this.#element).appendChild(context);
    }

    Debug(text) {
        console.log(text);
    }
}

export class EventSystem {         // Dados carregados do localStorage
    constructor(socket) {
        this.ws = socket; // guarda a conexão WebSocket
        this.eventHandlers = {};
        this.source = null;
        this.clientToken = "";
        this.serverData = {};       // Dados recebidos do servidor
        this.storage =  {};
        this.EventSystemReady = new Promise((resolve) => {
            this._resolveReady = resolve;
        });
    }

    getSessionId() {
        return this.storage.UserId || null;
    }

    setSource(source) {
        this.storage.source = source;
    }

    getSource() {
        return this.storage.source;
    }

    getUsername() {
        return this.storage.username || "";
    }

    getUserData() {
        return this.storage.UserData || {};
    }

    getCategoria() {
        return this.storage.categoria || "";
    }

    getLanguage() {
        return this.storage.language || "pt";
    }

    getTranslations() {
        return this.storage.translations || {};
    }

    setReady() {
        if (this._resolveReady) this._resolveReady();
    }

    // Atualiza storage local e localStorage
    setStorage(key, value) {
        this.storage[key] = value;
        $.storage(key).set(value);
        localStorage.setItem(key, JSON.stringify(value));
    }

    // Atualiza serverData quando recebe dados do servidor
    updateServerData(eventName, payload) {
        this.serverData[eventName] = payload;
    }

    // Recupera serverData de um evento específico
    getServerData(eventName) {
        return this.serverData[eventName] || null;
    }

    SetConnected(source) {
        this.source = source;
    }

    TriggerServerEvent(eventName, ...params) {
        this.EventSystemReady.then(() => {
            if (this.ws.readyState === WebSocket.OPEN) {
                this.ws.send(JSON.stringify({
                    event: eventName,
                    data: params
                }));
            } else {
                console.warn("WebSocket não conectado. Evento não enviado:", eventName);
            }
        });
    }

    RegisterServerEvent(eventName, callback = null) {
        this.EventSystemReady.then(() => {
            if (this.ws.readyState === WebSocket.OPEN) {
                this.ws.send(JSON.stringify({
                    action: "RegisterServerEvent",
                    event: eventName
                }));
                if (callback) callback(null, { success: true, event: eventName });
            } else {
                console.warn("WebSocket não conectado. Não foi possível registar evento:", eventName);
                if (callback) callback(new Error("WebSocket não conectado"), null);
            }
        });
    }

    // registrar eventos do cliente
    RegisterClientEvent(eventName, callback) {

        if (!this.eventHandlers[eventName]) {
            this.eventHandlers[eventName] = [];
        }
        this.eventHandlers[eventName].push(callback);

        // 👇 Se já houver eventos disparados antes, executa-os agora
        if (this.pendingEvents && this.pendingEvents[eventName]) {
            for (const params of this.pendingEvents[eventName]) {
                try {
                    callback(params);
                } catch (err) {
                    console.error(`Erro ao processar evento pendente "${eventName}":`, err);
                }
            }
            delete this.pendingEvents[eventName]; // limpa a fila
        }
    }


    TriggerEvent(eventName, ...params) {
        const callbacks = this.eventHandlers[eventName] || [];
        callbacks.forEach(cb => {
            try { cb(params); }
            catch(err) { console.error(`Erro no callback do evento "${eventName}":`, err); }
        });
    }

    async TriggerEventAsync(eventName, params) {
        const callbacks = this.eventHandlers[eventName];
        if (!callbacks || callbacks.length === 0) {
            if (!this.pendingEvents) this.pendingEvents = {};
            if (!this.pendingEvents[eventName]) this.pendingEvents[eventName] = [];
            this.pendingEvents[eventName].push(params);
            return null;
        }

        for (const cb of callbacks) {
            try {
                const result = await cb(params);
                if (result !== undefined) return result;
            } catch (err) {
                console.error(`Erro no callback do evento "${eventName}":`, err);
            }
        }
        return null;
    }
}
