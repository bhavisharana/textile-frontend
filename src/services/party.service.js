import { http } from "@/utils/http";

export const partyService = {
    async getParties() {
        const response = await http.get('/parties');
        return response.data;
    },

    async getPartyById(id) {
        const response = await http.get(`/parties/${id}`);
        return response.data;
    },

    async createParty(data) {
        const response = await http.post('/parties', data);
        return response.data;
    },

    async updateParty(id, data) {
        const response = await http.put(`/parties/${id}`, data);
        return response.data;
    },

    async deleteParty(id) {
        const response = await http.delete(`/parties/${id}`);
        return response.data;
    },
}