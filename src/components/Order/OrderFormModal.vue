<script setup>
import { ref, defineProps, defineEmits, computed, watch, onMounted } from "vue";
import { useForm } from "vee-validate";
import * as yup from "yup";
import BasicDialog from "../common/BasicDialog.vue";
import { useOrderStore } from "../../stores/order.js";
import { usePartyStore } from "../../stores/party.js";

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
  order: {
    type: Object,
    default: null,
  },
  labdip: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits(["update:isOpen", "close", "saved"]);

const orderStore = useOrderStore();
const partyStore = usePartyStore();

const isEditing = ref(false);
const editingId = ref(null);
const formError = ref(null);

// Yup validation schema
const orderSchema = yup.object({
  labdip_id: yup.number().nullable().optional(),
  labdip_no: yup.string().trim().required("Labdip Reference No is required"),
  party_name: yup.string().trim().required("Party Name is required"),
  quantity: yup
    .number()
    .transform((value, originalValue) =>
      String(originalValue).trim() === "" ? null : value,
    )
    .nullable()
    .required("Quantity is required")
    .positive("Quantity must be greater than 0"),
  rate: yup
    .number()
    .transform((value, originalValue) =>
      String(originalValue).trim() === "" ? null : value,
    )
    .nullable()
    .required("Rate is required")
    .positive("Rate must be greater than 0"),
  remarks: yup.string().nullable().optional(),
});

// Vee-validate form setup
const {
  handleSubmit,
  errors,
  resetForm: resetVeeForm,
  setValues,
  defineField,
} = useForm({
  validationSchema: orderSchema,
  initialValues: {
    labdip_id: null,
    labdip_no: "",
    party_name: "",
    quantity: "",
    rate: "",
    remarks: "",
  },
});

const [labdip_id] = defineField("labdip_id");
const [labdip_no, labdip_noProps] = defineField("labdip_no");
const [party_name, party_nameProps] = defineField("party_name");
const [quantity, quantityProps] = defineField("quantity");
const [rate, rateProps] = defineField("rate");
const [remarks, remarksProps] = defineField("remarks");

const calculatedTotal = computed(() => {
  const q = Number(quantity.value) || 0;
  const r = Number(rate.value) || 0;
  return (q * r).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
});

onMounted(() => {
  if (partyStore.parties.length === 0) {
    partyStore.fetchParties();
  }
});

const resetForm = () => {
  formError.value = null;
  if (props.order) {
    isEditing.value = true;
    editingId.value = props.order.id;
    setValues({
      labdip_id: props.order.labdip_id || null,
      labdip_no: props.order.labdip_no || "",
      party_name: props.order.party_name || "",
      quantity: props.order.quantity ?? "",
      rate: props.order.rate ?? "",
      remarks: props.order.remarks || "",
    });
  } else if (props.labdip) {
    isEditing.value = false;
    editingId.value = null;
    resetVeeForm({
      values: {
        labdip_id: props.labdip.id || null,
        labdip_no: props.labdip.labdip_no || "",
        party_name: props.labdip.party_name || "",
        quantity: "",
        rate: "",
        remarks: "",
      },
    });
  } else {
    isEditing.value = false;
    editingId.value = null;
    resetVeeForm({
      values: {
        labdip_id: null,
        labdip_no: "",
        party_name: "",
        quantity: "",
        rate: "",
        remarks: "",
      },
    });
  }
};

watch(
  () => [props.isOpen, props.order, props.labdip],
  ([newIsOpen]) => {
    if (newIsOpen) {
      resetForm();
      if (partyStore.parties.length === 0) {
        partyStore.fetchParties();
      }
    }
  },
  { immediate: true },
);

const closeModal = () => {
  emit("update:isOpen", false);
  emit("close");
};

const onSubmit = handleSubmit(async (data) => {
  formError.value = null;

  const payload = {
    labdip_id: data.labdip_id ? Number(data.labdip_id) : null,
    labdip_no: data.labdip_no,
    party_name: data.party_name,
    quantity: Number(data.quantity),
    rate: Number(data.rate),
    remarks: data.remarks || "",
  };

  let success = false;
  if (isEditing.value && editingId.value) {
    success = await orderStore.updateOrder(editingId.value, payload);
  } else {
    success = await orderStore.createOrder(payload);
  }

  if (success) {
    emit("saved");
    closeModal();
  } else {
    formError.value = orderStore.error || "Operation failed";
  }
});
</script>

<template>
  <BasicDialog
    :is-open="isOpen"
    :title="isEditing ? 'Edit Order' : 'Create New Order'"
    :subtitle="labdip ? `Linked to Approved Labdip: ${labdip.labdip_no}` : ''"
    max-width="640px"
    :loading="orderStore.loading"
    :submit-text="isEditing ? 'Update Order' : 'Save Order'"
    @close="closeModal"
    @submit="onSubmit"
  >
    <form id="order-form" @submit.prevent="onSubmit" class="modal-form-content">
      <div v-if="formError" class="alert alert-error">
        <span>{{ formError }}</span>
      </div>

      <div class="form-grid">
        <!-- Labdip Reference No -->
        <div class="form-group">
          <label for="labdip_no">Labdip Reference No *</label>
          <input
            id="labdip_no"
            v-model="labdip_no"
            v-bind="labdip_noProps"
            type="text"
            placeholder="e.g. LD-2026-001"
            class="form-control"
            :class="{ 'input-error': errors.labdip_no }"
            :readonly="!!labdip"
          />
          <span v-if="errors.labdip_no" class="field-error">{{
            errors.labdip_no
          }}</span>
        </div>

        <!-- Party Name -->
        <div class="form-group">
          <label for="party_name">Party Name *</label>
          <div class="party-select-wrapper">
            <select
              id="party_name"
              v-model="party_name"
              v-bind="party_nameProps"
              class="form-control"
              :class="{ 'input-error': errors.party_name }"
            >
              <option value="">-- Select from Party Master or Custom --</option>
              <option
                v-for="p in partyStore.parties"
                :key="p.id"
                :value="p.name"
              >
                {{ p.name }} ({{ p.code }})
              </option>
            </select>
          </div>
          <span v-if="errors.party_name" class="field-error">{{
            errors.party_name
          }}</span>
        </div>

        <!-- Quantity -->
        <div class="form-group">
          <label for="quantity">Quantity *</label>
          <input
            id="quantity"
            v-model="quantity"
            v-bind="quantityProps"
            type="number"
            step="any"
            placeholder="e.g. 500"
            class="form-control"
            :class="{ 'input-error': errors.quantity }"
          />
          <span v-if="errors.quantity" class="field-error">{{
            errors.quantity
          }}</span>
        </div>

        <!-- Rate -->
        <div class="form-group">
          <label for="rate">Rate *</label>
          <input
            id="rate"
            v-model="rate"
            v-bind="rateProps"
            type="number"
            step="any"
            placeholder="e.g. 25.50"
            class="form-control"
            :class="{ 'input-error': errors.rate }"
          />
          <span v-if="errors.rate" class="field-error">{{ errors.rate }}</span>
        </div>

        <!-- Total Amount Calculation Display -->
        <div class="form-group full-width">
          <div class="total-banner">
            <span>Total Calculated Amount:</span>
            <strong class="total-amount">${{ calculatedTotal }}</strong>
          </div>
        </div>

        <!-- Remarks -->
        <div class="form-group full-width">
          <label for="remarks">Remarks</label>
          <textarea
            id="remarks"
            v-model="remarks"
            v-bind="remarksProps"
            rows="3"
            placeholder="Enter order notes or shipping specifications..."
            class="form-control textarea-control"
          ></textarea>
        </div>
      </div>
    </form>
  </BasicDialog>
</template>

<style scoped>
.modal-form-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-group.full-width {
  grid-column: span 2;
}

.party-select-wrapper {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-group label {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-secondary);
}

.form-control {
  width: 100%;
  padding: 10px 14px;
  border: 1px solid var(--input-border);
  border-radius: 8px;
  font-size: 0.9rem;
  color: var(--input-text);
  outline: none;
  transition: all 0.2s ease;
  background: var(--input-bg);
  box-sizing: border-box;
}

.form-control[readonly] {
  background: var(--bg-surface);
  color: var(--text-muted);
  cursor: not-allowed;
}

.form-control:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);
}

.field-error {
  color: #ef4444;
  font-size: 0.775rem;
  margin-top: 2px;
}

.input-error {
  border-color: #ef4444 !important;
}

.total-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: var(--total-banner-bg);
  border: 1px solid var(--total-banner-border);
  border-radius: 8px;
  color: var(--total-banner-text);
  font-size: 0.9rem;
}

.total-amount {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--primary);
}

.alert-error {
  background: rgba(239, 68, 68, 0.12);
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: #fca5a5;
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 0.875rem;
}
</style>
