import { http } from "@/utils/http";

export const orderService={
    async getOrders(params) {
        const response = await http.get('/orders', { params });
        return response.data;
    },

    async getOrderById(id) {
        const response = await http.get(`/orders/${id}`);
        return response.data;
    },

    async createOrder(data) {
        const response = await http.post('/orders', data);
        return response.data;
    },

    async updateOrder(id, data) {
        const response = await http.put(`/orders/${id}`, data);
        return response.data;
    },

    async deleteOrder(id) {
        const response = await http.delete(`/orders/${id}`);
        return response.data;
    },
}