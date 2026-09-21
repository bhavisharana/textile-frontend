<script setup lang="ts">
import { ref, watch } from "vue";
import { useForm } from "vee-validate";
import * as yup from "yup";
import { useLabdipStore, type Labdip } from "../../stores/labdip";
import { useQualityStore } from "../../stores/quality";
import { usePartyStore } from "../../stores/party";

interface Props {
  isOpen: boolean;
  labdip?: Labdip | null;
}

const props = withDefaults(defineProps<Props>(), {
  isOpen: false,
  labdip: null,
});

const emit = defineEmits<{
  (e: "close"): void;
  (e: "update:isOpen", value: boolean): void;
  (e: "saved"): void;
}>();

const labdipStore = useLabdipStore();
const qualityStore = useQualityStore();
const partyStore = usePartyStore();

const isEditing = ref(false);
const editingId = ref<number | null>(null);
const statusOptions = ["Pending", "In Progress", "Approved", "Rejected"];
const formError = ref<string | null>(null);

// Yup validation schema
const labdipSchema = yup.object({
  labdip_no: yup.string().trim().required("Labdip No is required"),
  party_name: yup.string().trim().required("Party Name is required"),
  status: yup.string().required("Status is required"),
  quality_id: yup.number().nullable().optional(),
  quality_name: yup.string().trim().required("Quality Name is required"),
  color_name: yup.string().trim().required("Color Name is required"),
  received_date: yup.string().nullable().optional(),
  sending_date: yup.string().nullable().optional(),
  remarks: yup.string().nullable().optional(),
});

// Vee-validate form setup
const {
  handleSubmit,
  errors,
  resetForm: resetVeeForm,
  setValues,
  setFieldValue,
  defineField,
} = useForm({
  validationSchema: labdipSchema,
  initialValues: {
    labdip_no: "",
    party_name: "",
    status: "Pending",
    quality_id: null as number | null,
    quality_name: "",
    color_name: "",
    received_date: "",
    sending_date: "",
    remarks: "",
  },
});

const [labdip_no, labdip_noProps] = defineField("labdip_no");
const [party_name, party_nameProps] = defineField("party_name");
const [status, statusProps] = defineField("status");
const [quality_id, quality_idProps] = defineField("quality_id");
const [color_name, color_nameProps] = defineField("color_name");
const [received_date, received_dateProps] = defineField("received_date");
const [sending_date, sending_dateProps] = defineField("sending_date");
const [remarks, remarksProps] = defineField("remarks");

function formatDateForInput(dateStr?: string): string {
  if (!dateStr) return "";
  return new Date(dateStr).toISOString().split("T")[0];
}

function resetForm() {
  formError.value = null;
  if (props.labdip) {
    isEditing.value = true;
    editingId.value = props.labdip.id;
    setValues({
      labdip_no: props.labdip.labdip_no,
      party_name: props.labdip.party_name,
      status: props.labdip.status,
      quality_id: props.labdip.quality_id || null,
      quality_name: props.labdip.quality_name,
      color_name: props.labdip.color_name,
      received_date: formatDateForInput(props.labdip.received_date),
      sending_date: formatDateForInput(props.labdip.sending_date),
      remarks: props.labdip.remarks || "",
    });
  } else {
    isEditing.value = false;
    editingId.value = null;
    resetVeeForm({
      values: {
        labdip_no: "",
        party_name: "",
        status: "Pending",
        quality_id: null,
        quality_name: "",
        color_name: "",
        received_date: new Date().toISOString().split("T")[0],
        sending_date: "",
        remarks: "",
      },
    });
  }
}

watch(
  () => [props.isOpen, props.labdip],
  ([newIsOpen]) => {
    if (newIsOpen) {
      resetForm();
      if (qualityStore.qualities.length === 0) {
        qualityStore.fetchQualities();
      }
      if (partyStore.parties.length === 0) {
        partyStore.fetchParties();
      }
    }
  },
  { immediate: true },
);

// Auto-fill quality_name when quality_id is selected from dropdown
watch(quality_id, (newVal) => {
  if (newVal) {
    const selected = qualityStore.qualities.find(
      (q) => q.id === Number(newVal),
    );
    if (selected) {
      setFieldValue("quality_name", selected.quality_name);
    }
  }
});

function closeModal() {
  emit("update:isOpen", false);
  emit("close");
}

const onSubmit = handleSubmit(async (values) => {
  formError.value = null;

  const payload = {
    labdip_no: values.labdip_no,
    party_name: values.party_name,
    status: values.status,
    quality_id: values.quality_id ? Number(values.quality_id) : null,
    quality_name: values.quality_name,
    color_name: values.color_name,
    received_date: values.received_date || null,
    sending_date: values.sending_date || null,
    remarks: values.remarks || "",
  };

  let success = false;
  if (isEditing.value && editingId.value) {
    success = await labdipStore.updateLabdip(editingId.value, payload);
  } else {
    success = await labdipStore.createLabdip(payload);
  }

  if (success) {
    emit("saved");
    closeModal();
  } else {
    formError.value = labdipStore.error || "Operation failed";
  }
});
</script>

<template>
  <div v-if="isOpen" class="modal-backdrop" @click.self="closeModal">
    <div class="modal-card">
      <div class="modal-header">
        <h2 class="modal-title">
          {{ isEditing ? "Edit Labdip Entry" : "Create New Labdip Entry" }}
        </h2>
        <button class="btn-close" @click="closeModal">&times;</button>
      </div>

      <form @submit="onSubmit" class="modal-form">
        <div v-if="formError" class="alert-error">
          <span>{{ formError }}</span>
        </div>

        <div class="form-grid">
          <!-- Labdip No -->
          <div class="form-group">
            <label for="labdip_no">Labdip No *</label>
            <input id="labdip_no" v-model="labdip_no" v-bind="labdip_noProps" type="text" placeholder="e.g. LD-2026-001" :class="{ 'input-error': errors.labdip_no }"/>
            <span v-if="errors.labdip_no" class="field-error">{{ errors.labdip_no }}</span>
          </div>

          <!-- Party Name -->
          <div class="form-group">
            <label for="party_name">Party Name *</label>
            <div class="quality-select-wrapper">
              <select v-if="partyStore.parties.length > 0" v-model="party_name">
                <option value="">-- Select from Party Master or Custom --</option>
                <option v-for="p in partyStore.parties" :key="p.id" :value="p.name">{{ p.name }} ({{ p.code }})</option>
              </select>
              <input id="party_name" v-model="party_name" v-bind="party_nameProps" type="text" placeholder="Or enter Party Name manually" :class="{ 'input-error': errors.party_name }"/>
            </div>
            <span v-if="errors.party_name" class="field-error">{{ errors.party_name }}</span>
          </div>

          <!-- Status -->
          <div class="form-group">
            <label for="status">Status *</label>
            <select id="status" v-model="status" v-bind="statusProps" :class="{ 'input-error': errors.status }">
              <option v-for="opt in statusOptions" :key="opt" :value="opt">
                {{ opt }}
              </option>
            </select>
            <span v-if="errors.status" class="field-error">{{ errors.status }}</span>
          </div>

          <!-- Quality Selection / Name -->
          <div class="form-group">
            <label for="quality_select">Quality Name *</label>
            <div class="quality-select-wrapper">
              <select id="quality_select" v-model="quality_id" v-bind="quality_idProps">
                <option :value="null">
                  -- Select from Master or Custom --
                </option>
                <option v-for="q in qualityStore.qualities" :key="q.id" :value="q.id">
                  {{ q.quality_name }} ({{ q.code }})
                </option>
              </select>
            </div>
            <span v-if="errors.quality_name" class="field-error">{{ errors.quality_name }}</span>
          </div>

          <!-- Color Name -->
          <div class="form-group">
            <label for="color_name">Color Name *</label>
            <input id="color_name" v-model="color_name" v-bind="color_nameProps" type="text" placeholder="e.g. Navy Blue / Shade #4B" :class="{ 'input-error': errors.color_name }"/>
            <span v-if="errors.color_name" class="field-error">{{ errors.color_name }}</span>
          </div>

          <!-- Received Date -->
          <div class="form-group">
            <label for="received_date">Received Date</label>
            <input id="received_date" v-model="received_date" v-bind="received_dateProps" type="date"/>
          </div>

          <!-- Sending Date -->
          <div class="form-group">
            <label for="sending_date">Sending Date</label>
            <input id="sending_date" v-model="sending_date" v-bind="sending_dateProps" type="date"/>
          </div>

          <!-- Remarks -->
          <div class="form-group full-width">
            <label for="remarks">Remarks</label>
            <textarea id="remarks" v-model="remarks" v-bind="remarksProps" rows="3" placeholder="Enter any additional notes or instructions..."></textarea>
          </div>
        </div>

        <div class="modal-footer">
          <button type="button" class="btn-cancel" @click="closeModal">
            Cancel
          </button>
          <button type="submit" class="btn-save" :disabled="labdipStore.loading">
            <span v-if="labdipStore.loading" class="spinner"></span>
            <span v-else>{{ isEditing ? "Update Entry" : "Save Labdip Entry" }}</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 999;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--modal-overlay);
  backdrop-filter: blur(4px);
  padding: 16px;
}

.modal-card {
  width: 100%;
  max-width: 680px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  background: var(--modal-bg);
  border-radius: 16px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  border: 1px solid var(--border-color);
  overflow: hidden;
  animation: modalFadeIn 0.2s ease-out;
}

@keyframes modalFadeIn {
  from {
    opacity: 0;
    transform: scale(0.96);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid var(--border-color);
  background: var(--modal-bg);
}

.modal-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
}

.btn-close {
  font-size: 1.75rem;
  color: var(--text-muted);
  background: none;
  border: none;
  cursor: pointer;
  line-height: 1;
  padding: 2px 6px;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.btn-close:hover {
  color: var(--text-primary);
  background: var(--bg-surface);
}

.modal-form {
  padding: 24px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.alert-error {
  background: rgba(239, 68, 68, 0.12);
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: #fca5a5;
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 0.875rem;
}

.field-error {
  color: #ef4444;
  font-size: 0.775rem;
  margin-top: 2px;
}

.input-error {
  border-color: #ef4444 !important;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

@media (max-width: 640px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-group.full-width {
  grid-column: 1 / -1;
}

.form-group label {
  font-size: 0.825rem;
  font-weight: 600;
  color: var(--text-secondary);
}

.quality-select-wrapper {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 10px 14px;
  font-size: 0.9rem;
  border: 1px solid var(--input-border);
  border-radius: 8px;
  background-color: var(--input-bg);
  color: var(--input-text);
  outline: none;
  transition: all 0.2s ease;
  font-family: inherit;
  box-sizing: border-box;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);
}

.modal-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 16px;
  margin-top: 8px;
  border-top: 1px solid var(--border-color);
}

.btn-cancel {
  padding: 10px 20px;
  background: var(--btn-sec-bg);
  border: 1px solid var(--btn-sec-border);
  color: var(--btn-sec-text);
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-cancel:hover {
  background: var(--btn-sec-hover-bg);
  color: var(--btn-sec-hover-text);
}

.btn-save {
  padding: 10px 22px;
  background: var(--primary);
  border: none;
  color: #ffffff;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.btn-save:hover:not(:disabled) {
  background: var(--primary-hover);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.25);
}

.btn-save:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: #ffffff;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
