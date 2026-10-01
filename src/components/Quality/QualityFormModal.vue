<script setup>
import { ref, defineProps, defineEmits, watch } from "vue";
import { useForm } from "vee-validate";
import * as yup from "yup";
import BasicDialog from "../common/BasicDialog.vue";
import { useQualityStore } from "../../stores/quality.js";

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
  quality: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits(["update:isOpen", "close", "saved"]);

const qualityStore = useQualityStore();

const isEditing = ref(false);
const editingId = ref(null);
const formError = ref(null);

// Yup validation schema
const qualitySchema = yup.object({
  quality_name: yup.string().trim().required("Quality Name is required"),
  code: yup.string().trim().required("Quality Code is required"),
});

// Vee-validate form setup
const {
  handleSubmit,
  errors,
  resetForm: resetVeeForm,
  setValues,
  defineField,
} = useForm({
  validationSchema: qualitySchema,
  initialValues: {
    quality_name: "",
    code: "",
  },
});

const [quality_name, quality_nameProps] = defineField("quality_name");
const [code, codeProps] = defineField("code");

const resetModalForm = () => {
  formError.value = null;
  if (props.quality) {
    isEditing.value = true;
    editingId.value = props.quality.id;
    setValues({
      quality_name: props.quality.quality_name || "",
      code: props.quality.code || "",
    });
  } else {
    isEditing.value = false;
    editingId.value = null;
    resetVeeForm({
      values: {
        quality_name: "",
        code: "",
      },
    });
  }
};

watch(
  () => [props.isOpen, props.quality],
  ([newIsOpen]) => {
    if (newIsOpen) {
      resetModalForm();
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

  let success = false;
  if (isEditing.value && editingId.value) {
    success = await qualityStore.updateQuality(editingId.value, {
      quality_name: data.quality_name.trim(),
      code: data.code.trim(),
    });
  } else {
    success = await qualityStore.createQuality({
      quality_name: data.quality_name.trim(),
      code: data.code.trim(),
    });
  }

  if (success) {
    emit("saved");
    closeModal();
  } else {
    formError.value = qualityStore.error || "Operation failed";
  }
});
</script>

<template>
  <BasicDialog
    :is-open="isOpen"
    :title="isEditing ? 'Edit Quality' : 'Add New Quality'"
    max-width="480px"
    :loading="qualityStore.loading"
    :submit-text="isEditing ? 'Update Quality' : 'Create Quality'"
    @close="closeModal"
    @submit="onSubmit"
  >
    <form @submit.prevent="onSubmit" class="modal-form">
      <div v-if="formError" class="alert-error">
        <span>{{ formError }}</span>
      </div>

      <div class="form-group">
        <label for="quality_name">Quality Name *</label>
        <input
          id="quality_name"
          v-model="quality_name"
          v-bind="quality_nameProps"
          type="text"
          placeholder="e.g. Cotton 40s Satin"
          :class="{ 'input-error': errors.quality_name }"
        />
        <span v-if="errors.quality_name" class="field-error">{{
          errors.quality_name
        }}</span>
      </div>

      <div class="form-group">
        <label for="code">Quality Code *</label>
        <input
          id="code"
          v-model="code"
          v-bind="codeProps"
          type="text"
          placeholder="e.g. COT40S"
          :class="{ 'input-error': errors.code }"
        />
        <span v-if="errors.code" class="field-error">{{ errors.code }}</span>
      </div>
    </form>
  </BasicDialog>
</template>

<style scoped>
.modal-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.alert-error {
  background: rgba(239, 68, 68, 0.12);
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: #fca5a5;
  padding: 10px 14px;
  border-radius: 8px;
  font-size: 0.85rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-group label {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-secondary);
}

.form-group input {
  padding: 10px 14px;
  border: 1px solid var(--input-border);
  border-radius: 8px;
  font-size: 0.9rem;
  background: var(--input-bg);
  color: var(--input-text);
  outline: none;
  transition: all 0.2s ease;
}

.form-group input:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);
}

.form-group input.input-error {
  border-color: #ef4444;
}

.field-error {
  color: #ef4444;
  font-size: 0.775rem;
  font-weight: 500;
}
</style>
