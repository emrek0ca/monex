/**
* This file was @generated using pocketbase-typegen
*/

export enum Collections {
    MonexAccounts = "monex_accounts",
    MonexAiPreferences = "monex_ai_preferences",
    MonexAiQuery = "monex_ai_query",
    MonexBudgets = "monex_budgets",
    MonexCategories = "monex_categories",
    MonexDebtTransactions = "monex_debt_transactions",
    MonexGoals = "monex_goals",
    MonexInsights = "monex_insights",
    MonexNotifications = "monex_notifications",
    MonexPeople = "monex_people",
    MonexPortfolios = "monex_portfolios",
    MonexTransactions = "monex_transactions",
    MonexUsers = "monex_users",
}

// Alias types for improved usability
export type IsoDateString = string
export type RecordIdString = string
export type HTMLString = string

// System fields
export type BaseSystemFields<T = never> = {
    id: RecordIdString
    created: IsoDateString
    updated: IsoDateString
    collectionId: string
    collectionName: Collections
    expand?: T
}

export type AuthSystemFields<T = never> = {
    email: string
    emailVisibility: boolean
    username: string
    verified: boolean
} & BaseSystemFields<T>

// Record types for each collection

export enum MonexAccountsTypeOptions {
    "bank" = "bank",
    "cash" = "cash",
    "investment" = "investment",
    "savings" = "savings",
}

export type MonexAccountsRecord = {
    user?: RecordIdString
    type?: MonexAccountsTypeOptions
    balance?: number
    currency?: string
    name?: string
}

export enum MonexAiPreferencesAiToneOptions {
    "friendly" = "friendly",
    "professional" = "professional",
    "coach" = "coach",
}

export type MonexAiPreferencesRecord = {
    ai_tone?: MonexAiPreferencesAiToneOptions
    user?: RecordIdString
}

export type MonexAiQueryRecord = {
    prompt?: string
}

export type MonexBudgetsRecord = {
    user?: RecordIdString
    limit_amount?: number
    current_amount?: number
    category?: string
    start_date?: IsoDateString
    end_date?: IsoDateString
}

export type MonexCategoriesRecord = {
    user?: RecordIdString
    name?: string
    icon?: string
}

export enum MonexDebtTransactionsTypeOptions {
    "lent" = "lent",
    "borrowed" = "borrowed",
    "repayment_received" = "repayment_received",
    "repayment_made" = "repayment_made",
}

export type MonexDebtTransactionsRecord = {
    user?: RecordIdString
    person?: RecordIdString
    amount: number
    type: MonexDebtTransactionsTypeOptions
    description?: string
    date?: IsoDateString
    is_settled?: boolean
}

export type MonexGoalsRecord = {
    user?: RecordIdString
    title?: string
    targetAmount?: number
    currentAmount?: number
    deadline?: IsoDateString
    source_category?: string
}

export enum MonexInsightsTypeOptions {
    "info" = "info",
    "warning" = "warning",
    "suggestion" = "suggestion",
}

export type MonexInsightsRecord = {
    user?: RecordIdString
    text?: string
    type?: MonexInsightsTypeOptions
    source?: string
    related_id?: string
}

export enum MonexNotificationsKindOptions {
    "info" = "info",
    "success" = "success",
    "warning" = "warning",
    "danger" = "danger",
}

export type MonexNotificationsRecord = {
    title?: string
    message?: string
    kind?: MonexNotificationsKindOptions
    user?: RecordIdString
    isRead?: boolean
}

export enum MonexPeopleRelationOptions {
    "friend" = "friend",
    "family" = "family",
    "colleague" = "colleague",
    "other" = "other",
}

export type MonexPeopleRecord = {
    user?: RecordIdString
    name: string
    email?: string
    phone?: string
    relation?: MonexPeopleRelationOptions
    balance?: number
    avatar?: string
    last_transaction_date?: IsoDateString
}

export type MonexPortfoliosRecord = {
    user?: RecordIdString
    quantity?: number
    purchase_price?: number
    asset_id?: string
}

export enum MonexTransactionsTypeOptions {
    "income" = "income",
    "expense" = "expense",
    "transfer" = "transfer",
}

export type MonexTransactionsRecord = {
    user?: RecordIdString
    account?: RecordIdString
    amount?: number
    type?: MonexTransactionsTypeOptions
    note?: string
    date?: IsoDateString
    category?: string
    is_normal?: boolean
}

export enum MonexUsersLeagueOptions {
    "Bronz" = "Bronz",
    "Gümüş" = "Gümüş",
    "Altın" = "Altın",
    "Elmas" = "Elmas",
    "Elit" = "Elit",
}

export type MonexUsersRecord = {
    name?: string
    avatar?: string
    notifications_push?: boolean
    notifications_email?: boolean
    xp?: number
    streak?: number
    last_active?: IsoDateString
    league?: MonexUsersLeagueOptions
    daily_tasks?: null | any
    last_reward_date?: IsoDateString
    level?: number
    phone?: string
    currency?: string
    ai_queries_today?: number
    ai_queries_date?: IsoDateString
    subscription_status?: 'free' | 'pro' | 'expired'
    subscription_expires?: IsoDateString
    subscription_type?: 'monthly' | 'yearly'
}

// Response types include system fields and match responses from PocketBase
export type MonexAccountsResponse<Texpand = unknown> = Required<MonexAccountsRecord> & BaseSystemFields<Texpand>
export type MonexAiPreferencesResponse<Texpand = unknown> = Required<MonexAiPreferencesRecord> & BaseSystemFields<Texpand>
export type MonexAiQueryResponse<Texpand = unknown> = Required<MonexAiQueryRecord> & BaseSystemFields<Texpand>
export type MonexBudgetsResponse<Texpand = unknown> = Required<MonexBudgetsRecord> & BaseSystemFields<Texpand>
export type MonexCategoriesResponse<Texpand = unknown> = Required<MonexCategoriesRecord> & BaseSystemFields<Texpand>
export type MonexDebtTransactionsResponse<Texpand = unknown> = Required<MonexDebtTransactionsRecord> & BaseSystemFields<Texpand>
export type MonexGoalsResponse<Texpand = unknown> = Required<MonexGoalsRecord> & BaseSystemFields<Texpand>
export type MonexInsightsResponse<Texpand = unknown> = Required<MonexInsightsRecord> & BaseSystemFields<Texpand>
export type MonexNotificationsResponse<Texpand = unknown> = Required<MonexNotificationsRecord> & BaseSystemFields<Texpand>
export type MonexPeopleResponse<Texpand = unknown> = Required<MonexPeopleRecord> & BaseSystemFields<Texpand>
export type MonexPortfoliosResponse<Texpand = unknown> = Required<MonexPortfoliosRecord> & BaseSystemFields<Texpand>
export type MonexTransactionsResponse<Texpand = unknown> = Required<MonexTransactionsRecord> & BaseSystemFields<Texpand>
export type MonexUsersResponse<Texpand = unknown> = Required<MonexUsersRecord> & AuthSystemFields<Texpand>

// Types containing all Records and Responses, useful for interfaces
export type CollectionRecords = {
    [Collections.MonexAccounts]: MonexAccountsRecord
    [Collections.MonexAiPreferences]: MonexAiPreferencesRecord
    [Collections.MonexAiQuery]: MonexAiQueryRecord
    [Collections.MonexBudgets]: MonexBudgetsRecord
    [Collections.MonexCategories]: MonexCategoriesRecord
    [Collections.MonexDebtTransactions]: MonexDebtTransactionsRecord
    [Collections.MonexGoals]: MonexGoalsRecord
    [Collections.MonexInsights]: MonexInsightsRecord
    [Collections.MonexNotifications]: MonexNotificationsRecord
    [Collections.MonexPeople]: MonexPeopleRecord
    [Collections.MonexPortfolios]: MonexPortfoliosRecord
    [Collections.MonexTransactions]: MonexTransactionsRecord
    [Collections.MonexUsers]: MonexUsersRecord
}

export type CollectionResponses = {
    [Collections.MonexAccounts]: MonexAccountsResponse
    [Collections.MonexAiPreferences]: MonexAiPreferencesResponse
    [Collections.MonexAiQuery]: MonexAiQueryResponse
    [Collections.MonexBudgets]: MonexBudgetsResponse
    [Collections.MonexCategories]: MonexCategoriesResponse
    [Collections.MonexDebtTransactions]: MonexDebtTransactionsResponse
    [Collections.MonexGoals]: MonexGoalsResponse
    [Collections.MonexInsights]: MonexInsightsResponse
    [Collections.MonexNotifications]: MonexNotificationsResponse
    [Collections.MonexPeople]: MonexPeopleResponse
    [Collections.MonexPortfolios]: MonexPortfoliosResponse
    [Collections.MonexTransactions]: MonexTransactionsResponse
    [Collections.MonexUsers]: MonexUsersResponse
}
