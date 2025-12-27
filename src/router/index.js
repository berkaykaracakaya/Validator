import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from '@/pages/Dashboard.vue'
import EndpointList from '@/pages/EndpointList.vue'
import ValidationConfig from '@/pages/ValidationConfig.vue'
import TestRunner from '@/pages/TestRunner.vue'
import Results from '@/pages/Results.vue'

const routes = [
    {
        path: '/',
        name: 'Dashboard',
        component: Dashboard
    },
    {
        path: '/project/:id/endpoints',
        name: 'EndpointList',
        component: EndpointList,
        props: true
    },
    {
        path: '/endpoint/:id/configure',
        name: 'ValidationConfig',
        component: ValidationConfig,
        props: true
    },
    {
        path: '/endpoint/:id/test',
        name: 'TestRunner',
        component: TestRunner,
        props: true
    },
    {
        path: '/endpoint/:id/results',
        name: 'Results',
        component: Results,
        props: true
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router
