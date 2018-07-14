<template>
        <div class="frappe-list-form row no-gutters">
            <div class="col-4 border-right">
                <frappe-list :doctype="doctype" :filters="filters" :newDoc="openNewDoc" :key="doctype" @openForm="onOpenForm" @deleted="onDeleteFile" />
            </div>
            <div class="col-8">
                <div class="container">
                    <div class="row">
                        <div class="col-md-8 col-md-offset-2">
                            <form action="/api/method/file_transfer" method="post" enctype="multipart/form-data">
                                <div class="row">
                                    <div class="col-md-6">
                                        <label for="image_title">File Name</label>
                                        <input class="list-group-item item" type='text' ref="image_title" name="image_title"><br><br>
                                    </div>
                                    <div class="col-md-6">
                                        <br>
                                        <input class="list-group-item item" type="submit">
                                    </div>
                                </div>
                                <input class="list-group-item item" type="file" ref="image" name="filetoupload" @change="display()"><br><br>
                            </form>
                            <div v-if="imgshow">
                                <img :src="preview()">
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
</template>
<script>
import frappe from "frappejs";
import List from '../../components/List/List';

export default {
    data(){
        return {
            imgshow : false,
        }
    },
    props: ['doctype', 'name', 'filters'],
    components: {
        FrappeList: List,
    },
    methods: {
        display(){
            this.imgshow=true;
        },
        preview(){
                return URL.createObjectURL(this.$refs.image.files[0]);
        },
        onSave(doc) {
             if (doc.name !== this.$route.params.name) {
                this.$router.push(`/edit/${doc.doctype}/${doc.name}`);
            }
        },
        onOpenForm(name) {
            this.$router.push(`/Fedit/${this.doctype}/${name}`);
        },
        async openNewDoc() {
            let doc = await frappe.getNewDoc(this.doctype);
            this.$router.push(`/Fpick/FileContent`);
        },
        async onDeleteFile(checkList){
            console.log(checkList);
            await frappe.call({
                method: 'file_delete',
                args: checkList
            });
        }
    }
}
</script>