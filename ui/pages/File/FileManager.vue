<template>
    <div class="frappe-list-form row no-gutters">
        <div class="col-4 border-right">
            <frappe-list :doctype="doctype" :key="doctype" @newDoc="openNewDoc" @openForm="onOpenForm" />
        </div>
        <div v-if="name" class="col-8">
            <frappe-form v-if="name" :key="doctype + name" :doctype="doctype" :name="name" @save="onSave" />
            <div v-if="onload" style="text-align:center">
                <img :src="source()">
            </div>
        </div>
    </div>
</template>
<script>
import List from '../../components/List/List';
import Form from '../../components/Form/Form';

export default {
    data(){
        return{
            onload:true,
            src:"#",
            lame:'-'
        }
    },
    props: ['doctype', 'name'],
    components: {
        FrappeList: List,
        FrappeForm: Form
    },
    async mounted(){
        if(this.name!=undefined)
        {
            this.onload=false;
            let file = await frappe.getDoc('FileContent', this.name);
            this.src = "../../static/"+file.path.split("/")[2];
            this.onload=true;
            this.lame=this.name;
        }
    },
    async updated(){
        if(this.name!=undefined)
        {    
            if(this.name!=this.lame)
            {
                this.onload=false;
                let file = await frappe.getDoc('FileContent', this.name);
                this.src = "../../static/"+file.path.split("/")[2];
                this.onload=true;
                this.lame=this.name;
            }
        }
    },
    methods: {
        source(){
            return this.src;
        },
        onSave(doc) {
             if (doc.name !== this.$route.params.name) {
                this.$router.push(`/FileEdit/${doc.doctype}/${doc.name}`);
            }
        },
        onOpenForm(name) {
            this.$router.push(`/FileEdit/${this.doctype}/${name}`);
        },
        async openNewDoc() {
            let doc = await frappe.getNewDoc(this.doctype);
            this.$router.push(`/FilePick/FileContent`);
        },
    }
}
</script>
<style>
.frappe-list-form {
    min-height: calc(100vh - 4rem);
}
</style>
