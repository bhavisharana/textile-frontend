<script setup>
import { ref, defineProps, defineEmits, watch } from 'vue'
import { useForm } from 'vee-validate'
import * as yup from 'yup'
import BasicDialog from '../common/BasicDialog.vue'
import { usePartyStore } from '../../stores/party.js'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
  party: {
    type: Object,
    default: null,
  },
})

const emit = defineEmits(['update:isOpen', 'close', 'saved'])

const partyStore = usePartyStore()

const isEditing = ref(false)
const editingId = ref(null)
const formError = ref(null)

// Yup validation schema
const partySchema = yup.object({
  name: yup.string().trim().required('Party Name is required'),
  code: yup.string().trim().required('Party Code is required'),
})

// Vee-validate form setup
const {
  handleSubmit,
  errors,
  resetForm: resetVeeForm,
  setValues,
  defineField,
} = useForm({
  validationSchema: partySchema,
  initialValues: {
    name: '',
    code: '',
  },
})

const [name, nameProps] = defineField('name')
const [code, codeProps] = defineField('code')

const resetModalForm = () => {
  formError.value = null
  if (props.party) {
    isEditing.value = true
    editingId.value = props.party.id
    setValues({
      name: props.party.name || '',
      code: props.party.code || '',
    })
  } else {
    isEditing.value = false
    editingId.value = null
    resetVeeForm({
      values: {
        name: '',
        code: '',
      },
    })
  }
}

watch(
  () => [props.isOpen, props.party],
  ([newIsOpen]) => {
    if (newIsOpen) {
      resetModalForm()
    }
  },
  { immediate: true }
)

const closeModal = () => {
  emit('update:isOpen', false)
  emit('close')
}

const onSubmit = handleSubmit(async (values) => {
  formError.value = null

  let success = false
  if (isEditing.value && editingId.value) {
    success = await partyStore.updateParty(editingId.value, {
      name: values.name.trim(),
      code: values.code.trim(),
    })
  } else {
    success = await partyStore.createParty({
      name: values.name.trim(),
      code: values.code.trim(),
    })
  }

  if (success) {
    emit('saved')
    closeModal()
  } else {
    formError.value = partyStore.error || 'Operation failed'
  }
})
</script>

<template>
  <BasicDialog
    :is-open="isOpen"
    :title="isEditing ? 'Edit Party' : 'Add New Party'"
    max-width="480px"
    :loading="partyStore.loading"
    :submit-text="isEditing ? 'Update Party' : 'Create Party'"
    @close="closeModal"
    @submit="onSubmit"
  >
    <form @submit.prevent="onSubmit" class="modal-form">
      <div v-if="formError" class="alert alert-error">
        <span>{{ formError }}</span>
      </div>

      <div class="form-group">
        <label for="party_name">Party Name *</label>
        <input
          v-model="name"
          v-bind="nameProps"
          type="text"
          placeholder="e.g. Acme Textile Traders"
          :class="{ 'input-error': errors.name }"
        />
        <span v-if="errors.name" class="field-error">{{ errors.name }}</span>
      </div>

      <div class="form-group">
        <label for="code">Party Code *</label>
        <input
          id="code"
          v-model="code"
          v-bind="codeProps"
          type="text"
          placeholder="e.g. ACM-001"
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
