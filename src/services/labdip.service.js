import { http } from "@/utils/http";

export const labdipService={
    async getLabdips(params) {
        const response = await http.get('/labdips', { params });
        return response.data;
    },
    
    async getLabdipById(id) {
        const response = await http.get(`/labdips/${id}`);
        return response.data;
    },
    
    async createLabdip(data) {
        const response = await http.post('/labdips', data);
        return response.data;
    },
    
    async updateLabdip(id, data) {
        const response = await http.put(`/labdips/${id}`, data);
        return response.data;
    },
    
    async deleteLabdip(id) {
        const response = await http.delete(`/labdips/${id}`);
        return response.data;
    },
}