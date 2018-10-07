<template>
    <div class="modal-mask">
        <div class="modal-wrapper">
            <div class="modal-container">
                <h3 class="modal-header">
                    Create something
                </h3>
                <div class="modal-body">
                    Custom Modal
                    <slot></slot>
                </div>
                <div>
                    <button class="btn btn-sm btn-danger" @click="$emit('closeModal')">Close</button>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.modal-mask {
  position: fixed;
  z-index: 9998;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: table;
}

.modal-wrapper {
  display: table-cell;
  vertical-align: middle;
}

.modal-container {
  max-width: 80%;
  min-height: 30%;
  background-color: white;
  margin: 0 auto;
  border-radius: 5px;
}

.modal-body {
  display: block;
}
</style>

