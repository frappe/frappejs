<template>
        <div class="container">
            <h1>File Pick</h1>
            <div class="row">
                <form action="/api/method/file_transfer" method="post" enctype="multipart/form-data">
                    <label for="image_title">File Name</label>
                    <input class="list-group-item item" type='text' ref="image_title" name="image_title"><br><br>
                    <input class="list-group-item item" type="file" ref="image" name="filetoupload" @change="display()"><br><br>
                    <input class="list-group-item item" type="submit">
                </form>
                <div v-if="imgshow" class="col-md-6">
                    <img :src="preview()">
                </div>
            </div>
        </div>
</template>
<script>
import frappe from "frappejs";

export default{
    data(){
        return {
            imgshow : false,
        }
    },
    methods: {
        display(){
            this.imgshow=true;
        },
        preview(){
                return URL.createObjectURL(this.$refs.image.files[0]);
        }
    }
}
</script>