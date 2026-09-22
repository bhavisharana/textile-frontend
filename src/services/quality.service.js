import { http } from "@/utils/http";

export const qualityService={
    async getQualities() {
        const response = await http.get('/qualities');
        return response.data;
    },

    async getQualityById(id) {
        const response = await http.get(`/qualities/${id}`);
        return response.data;
    },

    async createQuality(data) {
        const response = await http.post('/qualities', data);
        return response.data;
    },

    async updateQuality(id, data) {
        const response = await http.put(`/qualities/${id}`, data);
        return response.data;
    },

    async deleteQuality(id) {
        const response = await http.delete(`/qualities/${id}`);
        return response.data;
    },
}