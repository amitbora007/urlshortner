const app = new Vue({
	el: '#app',
	data: {
		url: '',
		slug: '',
		dslug: '',
		created: null,
		removed: null,
	},
	methods: {
		async createUrl(){
			const response = await fetch('/',{
				method: 'POST',
				headers:{
					'content-type': 'application/json',
				},
				body: JSON.stringify({
					url: this.url,
					slug: this.slug
				})
			});
			this.created = await response.json();
		},
		async deleteUrl(){
			const response = await fetch('/',{
				method: 'delete',
				headers:{
					'content-type': 'application/json',
				},
				body: JSON.stringify({
					slug: this.dslug
				})
			});
			this.removed = await response.json();
		}
	}
})