/* eslint-disable @typescript-eslint/no-use-before-define */
import { _stop, objectId, EndpointResponse, PrivateUser } from "@factor/api"
import { getPrivateUser } from "@factor/server"
import {
  FactorQuery,
  FactorEndpoint,
  EndpointMeta,
  EndpointManageAction,
  EndpointMethodOptions,
} from "@factor/engine"
import { PaymentsEndpointMethodWithBearer } from "./serverTypes"
import { paymentsSetting } from "./util"
import { CustomerData } from "./types"
import Stripe from "stripe"

type RefineResult = {
  customerData?: CustomerData
  user?: PrivateUser
}
abstract class FactorQueryPayments extends FactorQuery {
  constructor() {
    super()
  }

  async refine(
    params: { customerId?: string; userId?: string },
    meta: EndpointMeta,
  ): Promise<RefineResult> {
    const { customerId, userId } = params

    const out: RefineResult = {}

    if (customerId) {
      const r = await Queries.GetCustomerData.run({ customerId }, meta)
      out.customerData = r.data
    }

    if (userId) {
      const privateDataResponse = await getPrivateUser({
        userId,
      })
      out.user = privateDataResponse.data
    }

    return out
  }
}

export const stripeEnv = (): "production" | "development" => {
  const env = process.env.STRIPE_ENV || process.env.NODE_ENV || "development"

  return env as "production" | "development"
}

export const stripeSecretKey = (): string => {
  const stripeSecretKey =
    stripeEnv() == "production"
      ? process.env.STRIPE_SECRET_KEY
      : process.env.STRIPE_SECRET_KEY_TEST

  if (!stripeSecretKey) {
    throw new Error(`Stripe secret key missing: ${stripeEnv()}`)
  }

  return stripeSecretKey
}

export const getStripe = (): Stripe => {
  return new Stripe(stripeSecretKey(), { apiVersion: "2020-08-27" })
}

// export const manageCustomer: PaymentsEndpointMethodWithBearer<
//   "manageCustomer"
// > = async (args) => {
//   const stripe = getStripe()

//   const { onCustomerCreated } = paymentsSetting("hooks") ?? {}

//   const { _action, customerId } = args

//   let customer: Stripe.Customer | Stripe.DeletedCustomer

//   if (_action == "create" || (_action == "retrieve" && !customerId)) {
//     const { email = "", name = "", id = "" } = args

//     customer = await stripe.customers.create({
//       email,
//       name,
//       metadata: { id },
//     })

//     if (onCustomerCreated) {
//       await onCustomerCreated({ customer, email, id, name })
//     }
//   } else if (customerId) {
//     customer = await stripe.customers.retrieve(customerId)
//   } else {
//     throw _stop({ message: "could not get Stripe customer" })
//   }

//   return { status: "success", data: customer, customerId: customer.id }
// }
class QueryManageCustomer extends FactorQueryPayments {
  async run(
    params: {
      customerId?: string
      id?: string
      name?: string
      email?: string
      _action: EndpointManageAction
    },
    meta: EndpointMeta,
  ): Promise<
    EndpointResponse<Stripe.Customer | Stripe.DeletedCustomer> & {
      customerId: string
      customerData?: CustomerData
    }
  > {
    const stripe = getStripe()

    const { onCustomerCreated } = paymentsSetting("hooks") ?? {}

    const { _action, customerId } = params

    let customer: Stripe.Customer | Stripe.DeletedCustomer

    if (_action == "create" || (_action == "retrieve" && !customerId)) {
      const { email = "", name = "", id = "" } = params

      customer = await stripe.customers.create({
        email,
        name,
        metadata: { id },
      })

      if (onCustomerCreated) {
        await onCustomerCreated({ customer, email, id, name })
      }
    } else if (customerId) {
      customer = await stripe.customers.retrieve(customerId)
    } else {
      throw this.stop({ message: "could not get Stripe customer" })
    }

    const { customerData } = await this.refine(
      {
        customerId: customer.id,
      },
      meta,
    )

    return {
      status: "success",
      data: customer,
      customerId: customer.id,
      customerData,
    }
  }
}

// export const managePaymentMethod: PaymentsEndpointMethodWithBearer<
//   "managePaymentMethod"
// > = async (args) => {
//   const { _action, customerId, paymentMethodId } = args

//   if (!_action) throw _stop({ message: "no _action provided" })
//   if (!customerId) throw _stop({ message: "no customer id" })

//   const stripe = getStripe()

//   // https://stripe.com/docs/api/setup_intents
//   let setupIntent: Stripe.SetupIntent | undefined

//   if (paymentMethodId) {
//     if (_action == "create") {
//       setupIntent = await stripe.setupIntents.create({
//         customer: customerId,
//         payment_method: paymentMethodId,
//         confirm: true,
//         description: "CC",
//         usage: "off_session",
//       })

//       await managePaymentMethod({
//         ...args,
//         _action: "setDefault",
//         customerId,
//         paymentMethodId,
//       })
//     } else if (_action == "setDefault") {
//       if (!paymentMethodId) throw _stop({ message: "no payment id" })
//       await stripe.customers.update(customerId, {
//         invoice_settings: {
//           default_payment_method: paymentMethodId,
//         },
//       })
//     } else if (_action == "delete") {
//       await stripe.paymentMethods.detach(paymentMethodId)
//     } else if (_action == "attach") {
//       await stripe.paymentMethods.attach(paymentMethodId, {
//         customer: customerId,
//       })

//       await managePaymentMethod({
//         ...args,
//         _action: "setDefault",
//         customerId,
//         paymentMethodId,
//       })
//     }
//   } else if (_action != "retrieve") {
//     throw _stop({ message: `no payment method id for ${_action}` })
//   }

//   const paymentMethods = await stripe.paymentMethods.list({
//     customer: customerId,
//     type: "card",
//   })

//   return { status: "success", data: paymentMethods, customerId, setupIntent }
// }

class QueryPaymentMethod extends FactorQueryPayments {
  async run(
    params: {
      customerId: string
      paymentMethodId?: string
      _action: EndpointManageAction
    },
    meta: EndpointMeta,
  ): Promise<
    EndpointResponse<Stripe.ApiList<Stripe.PaymentMethod>> & {
      customerId: string
      customerData?: CustomerData
      setupIntent?: Stripe.SetupIntent
    }
  > {
    const { _action, customerId, paymentMethodId } = params

    if (!_action) throw this.stop({ message: "no _action provided" })
    if (!customerId) throw this.stop({ message: "no customer id" })

    const stripe = getStripe()

    // https://stripe.com/docs/api/setup_intents
    let setupIntent: Stripe.SetupIntent | undefined

    if (paymentMethodId) {
      if (_action == "create") {
        setupIntent = await stripe.setupIntents.create({
          customer: customerId,
          payment_method: paymentMethodId,
          confirm: true,
          description: "CC",
          usage: "off_session",
        })

        await this.run(
          {
            _action: "setDefault",
            customerId,
            paymentMethodId,
          },
          meta,
        )
      } else if (_action == "setDefault") {
        if (!paymentMethodId) throw _stop({ message: "no payment id" })
        await stripe.customers.update(customerId, {
          invoice_settings: {
            default_payment_method: paymentMethodId,
          },
        })
      } else if (_action == "delete") {
        await stripe.paymentMethods.detach(paymentMethodId)
      } else if (_action == "attach") {
        await stripe.paymentMethods.attach(paymentMethodId, {
          customer: customerId,
        })

        await this.run(
          {
            _action: "setDefault",
            customerId,
            paymentMethodId,
          },
          meta,
        )
      }
    } else if (_action != "retrieve") {
      throw this.stop({ message: `no payment method id for ${_action}` })
    }

    const paymentMethods = await stripe.paymentMethods.list({
      customer: customerId,
      type: "card",
    })

    return { status: "success", data: paymentMethods, customerId, setupIntent }
  }
}

// export const listCustomerSubscriptions: PaymentsEndpointMethodWithBearer<
//   "listCustomerSubscriptions"
// > = async (args) => {
//   const { customerId } = args

//   if (!customerId) throw _stop({ message: "no customer id" })

//   const stripe = getStripe()
//   const data = await stripe.subscriptions.list({ customer: customerId })

//   return { status: "success", data }
// }

class QueryListSubscriptions extends FactorQueryPayments {
  async run(params: {
    customerId: string
  }): Promise<EndpointResponse<Stripe.ApiList<Stripe.Subscription>>> {
    const { customerId } = params

    if (!customerId) throw this.stop({ message: "no customer id" })

    const stripe = getStripe()
    const data = await stripe.subscriptions.list({ customer: customerId })

    return { status: "success", data }
  }
}

// export const manageSubscription: PaymentsEndpointMethodWithBearer<
//   "manageSubscription"
// > = async (args, { bearer }) => {
//   const {
//     customerId,
//     _action,
//     paymentMethodId,
//     priceId,
//     coupon,
//     idempotencyKey,
//     subscriptionId,
//     note,
//   } = args

//   if (!_action) throw _stop({ message: "no _action provided" })
//   if (!customerId) throw _stop({ message: "no customer id" })

//   const stripe = getStripe()
//   const { onSubscriptionUpdate } = paymentsSetting("hooks") ?? {}

//   // attach payment method to customer
//   if (paymentMethodId && customerId) {
//     await managePaymentMethod({
//       ...args,
//       customerId,
//       paymentMethodId,
//       _action: "attach",
//     })
//   }

//   let sub: Stripe.Subscription | undefined
//   let message: string | undefined = undefined
//   try {
//     if (_action == "create") {
//       const { beforeCreateSubscription } = paymentsSetting("hooks") ?? {}

//       let args: Stripe.SubscriptionCreateParams = {
//         customer: customerId,
//         items: [{ price: priceId }],
//         coupon,
//         expand: ["latest_invoice.payment_intent"],
//         trial_period_days: 14,
//       }

//       if (beforeCreateSubscription) {
//         args = await beforeCreateSubscription(args)
//       }

//       sub = await stripe.subscriptions.create(args, { idempotencyKey })

//       const suffix = coupon ? ` with code ${coupon}` : ""
//       message = `subscription created ${suffix}`
//     } else if (_action == "retrieve") {
//       if (!subscriptionId) throw _stop({ message: "no subscription id" })

//       sub = await stripe.subscriptions.retrieve(subscriptionId)
//     } else if (_action == "delete") {
//       if (!subscriptionId) throw _stop({ message: "no subscription id" })

//       sub = await stripe.subscriptions.del(subscriptionId)
//       await stripe.customers.update(customerId, {
//         metadata: { cancelReason: note ?? "" },
//       })
//       message = "subscription deleted"
//     }
//   } catch (error: unknown) {
//     const e = error as Error
//     throw _stop({ message: e.message })
//   }

//   if (sub && onSubscriptionUpdate) {
//     await onSubscriptionUpdate(sub)
//   }

//   return {
//     status: "success",
//     data: sub,
//     customerId,
//     userId: bearer.userId,
//     message,
//   }
// }

class QueryManageSubscription extends FactorQueryPayments {
  async run(
    params: {
      _action?: EndpointManageAction
      customerId?: string
      paymentMethodId?: string
      priceId?: string
      idempotencyKey?: string
      coupon?: string
      subscriptionId?: string
      note?: string
    },
    meta: EndpointMeta,
  ): Promise<
    EndpointResponse<Stripe.Subscription> & {
      customerId: string
      customerData?: CustomerData
      userId?: string
      user?: PrivateUser
    }
  > {
    const {
      customerId,
      _action,
      paymentMethodId,
      priceId,
      coupon,
      idempotencyKey,
      subscriptionId,
      note,
    } = params

    if (!_action) throw this.stop({ message: "no _action provided" })
    if (!customerId) throw this.stop({ message: "no customer id" })

    const stripe = getStripe()
    const { onSubscriptionUpdate } = paymentsSetting("hooks") ?? {}

    // attach payment method to customer
    if (paymentMethodId && customerId) {
      await Queries.ManagePaymentMethod.run(
        {
          customerId,
          paymentMethodId,
          _action: "attach",
        },
        meta,
      )
    }

    let sub: Stripe.Subscription | undefined
    let message: string | undefined = undefined
    try {
      if (_action == "create") {
        const { beforeCreateSubscription } = paymentsSetting("hooks") ?? {}

        let args: Stripe.SubscriptionCreateParams = {
          customer: customerId,
          items: [{ price: priceId }],
          coupon,
          expand: ["latest_invoice.payment_intent"],
          trial_period_days: 14,
        }

        if (beforeCreateSubscription) {
          args = await beforeCreateSubscription(args)
        }

        sub = await stripe.subscriptions.create(args, { idempotencyKey })

        const suffix = coupon ? ` with code ${coupon}` : ""
        message = `subscription created ${suffix}`
      } else if (_action == "retrieve") {
        if (!subscriptionId) throw this.stop({ message: "no subscription id" })

        sub = await stripe.subscriptions.retrieve(subscriptionId)
      } else if (_action == "delete") {
        if (!subscriptionId) throw this.stop({ message: "no subscription id" })

        sub = await stripe.subscriptions.del(subscriptionId)
        await stripe.customers.update(customerId, {
          metadata: { cancelReason: note ?? "" },
        })
        message = "subscription deleted"
      }
    } catch (error: unknown) {
      const e = error as Error
      throw _stop({ message: e.message })
    }

    if (sub && onSubscriptionUpdate) {
      await onSubscriptionUpdate(sub)
    }

    const { customerData, user } = await this.refine(
      {
        customerId,
        userId: meta.bearer?.userId,
      },
      meta,
    )

    return {
      status: "success",
      data: sub,
      customerId,
      customerData,
      userId: meta.bearer?.userId,
      user,
      message,
    }
  }
}

// export const getInvoices: PaymentsEndpointMethodWithBearer<
//   "getInvoices"
// > = async (args) => {
//   const { customerId, startingAfter, limit } = args
//   const stripe = getStripe()
//   const data = await stripe.invoices.list({
//     customer: customerId,
//     starting_after: startingAfter,
//     limit,
//   })
//   return { status: "success", data, customerId }
// }

class QueryGetInvoices extends FactorQueryPayments {
  async run(
    params: {
      customerId: string
      limit?: number
      startingAfter?: string
    },
    meta: EndpointMeta,
  ): Promise<
    EndpointResponse<Stripe.ApiList<Stripe.Invoice>> & {
      customerId: string
      customerData?: CustomerData
    }
  > {
    const { customerId, startingAfter, limit } = params
    const stripe = getStripe()
    const data = await stripe.invoices.list({
      customer: customerId,
      starting_after: startingAfter,
      limit,
    })

    const { customerData } = await this.refine(
      {
        customerId,
      },
      meta,
    )

    return { status: "success", data, customerId, customerData }
  }
}

// export const getProduct: PaymentsEndpointMethodWithBearer<
//   "getProduct"
// > = async (args) => {
//   const { productId } = args
//   const stripe = getStripe()
//   const product = await stripe.products.retrieve(productId)

//   return { status: "success", data: product }
// }

class QueryGetProduct extends FactorQueryPayments {
  async run(params: {
    productId: string
  }): Promise<EndpointResponse<Stripe.Product>> {
    const { productId } = params
    const stripe = getStripe()
    const product = await stripe.products.retrieve(productId)

    return { status: "success", data: product }
  }
}

// export const getAllProducts: PaymentsEndpointMethodWithBearer<
//   "getAllProducts"
// > = async (args) => {
//   const products = paymentsSetting(`products`) ?? []

//   const productIds = products
//     .map((_) => _.productId)
//     .filter((_) => _) as string[]

//   const responsePlans = await Promise.all(
//     productIds.map((productId: string) => getProduct({ ...args, productId })),
//   )
//   const data = responsePlans
//     .map((product) => product.data)
//     .filter((_) => _) as Stripe.Product[]

//   return { status: "success", data }
// }

class QueryAllProducts extends FactorQueryPayments {
  async run(_params: undefined): Promise<EndpointResponse<Stripe.Product[]>> {
    const products = paymentsSetting(`products`) ?? []

    const productIds = products
      .map((_) => _.productId)
      .filter((_) => _) as string[]

    const responsePlans = await Promise.all(
      productIds.map((productId: string) =>
        Queries.GetProduct.run({ productId }),
      ),
    )
    const data = responsePlans
      .map((product) => product.data)
      .filter((_) => _) as Stripe.Product[]

    return { status: "success", data }
  }
}

// export const getCoupon: PaymentsEndpointMethodWithBearer<"getCoupon"> = async (
//   args,
// ) => {
//   const { couponCode } = args

//   if (!couponCode) throw _stop({ message: "no code was provided" })

//   const stripe = getStripe()

//   try {
//     const data = await stripe.coupons.retrieve(couponCode)
//     return { status: "success", data }
//   } catch (error: unknown) {
//     throw _stop({
//       message: "payment API error",
//       data: error as Stripe.Errors["StripeError"],
//     })
//   }
// }

class QueryGetCoupon extends FactorQueryPayments {
  async run({
    couponCode,
  }: {
    couponCode: string
  }): Promise<EndpointResponse<Stripe.Response<Stripe.Coupon>>> {
    if (!couponCode) throw this.stop({ message: "no code was provided" })

    const stripe = getStripe()

    try {
      const data = await stripe.coupons.retrieve(couponCode)
      return { status: "success", data }
    } catch (error: unknown) {
      throw this.stop({
        message: "payment API error",
        data: error as Stripe.Errors["StripeError"],
      })
    }
  }
}

// export const getCustomerData: PaymentsEndpointMethodWithBearer<
//   "getCustomerData"
// > = async (args) => {
//   const [customer, subscriptions, invoices, paymentMethods, allProducts] =
//     await Promise.all([
//       manageCustomer({ ...args, _action: "retrieve" }),
//       listCustomerSubscriptions({ ...args }),
//       getInvoices(args),
//       managePaymentMethod({ ...args, _action: "retrieve" }),
//       getAllProducts(args),
//     ])

//   const data: CustomerData = {
//     subscriptions: subscriptions.data,
//     customer: customer.data,
//     invoices: invoices.data,
//     paymentMethods: paymentMethods.data,
//     allProducts: allProducts.data,
//     idempotencyKey: objectId(),
//   }
//   return { status: "success", data }
// }

class QueryGetCustomerData extends FactorQueryPayments {
  constructor() {
    super()
  }
  async run(
    {
      customerId,
    }: {
      customerId: string
    },
    meta: EndpointMeta,
  ): Promise<EndpointResponse<CustomerData>> {
    const [customer, subscriptions, invoices, paymentMethods, allProducts] =
      await Promise.all([
        Queries.ManageCustomer.run({ customerId, _action: "retrieve" }, meta),
        Queries.ListSubscriptions.run({ customerId }),
        Queries.GetInvoices.run({ customerId }, meta),
        Queries.ManagePaymentMethod.run(
          { customerId, _action: "retrieve" },
          meta,
        ),
        Queries.AllProducts.run(undefined),
      ])

    const data: CustomerData = {
      subscriptions: subscriptions.data,
      customer: customer.data,
      invoices: invoices.data,
      paymentMethods: paymentMethods.data,
      allProducts: allProducts.data,
      idempotencyKey: objectId(),
    }
    return { status: "success", data }
  }
}

const Queries = {
  ManageCustomer: new QueryManageCustomer(),
  ListSubscriptions: new QueryListSubscriptions(),
  GetInvoices: new QueryGetInvoices(),
  ManageSubscription: new QueryManageSubscription(),
  ManagePaymentMethod: new QueryPaymentMethod(),
  GetCustomerData: new QueryGetCustomerData(),
  AllProducts: new QueryAllProducts(),
  GetProduct: new QueryGetProduct(),
  GetCoupon: new QueryGetCoupon(),
}

class EndpointMethodPayments<T extends FactorQuery> extends FactorEndpoint<T> {
  constructor(options: EndpointMethodOptions<T>) {
    super({ basePath: "/payments", ...options })
  }
}

export const PaymentEndpoints = Object.entries(Queries).map(([key, query]) => {
  return new EndpointMethodPayments({ key, queryHandler: query })
})

// export const EPMap: EndpointMethods = {
//   listCustomerSubscriptions,
//   manageCustomer,
//   getCustomerData,
//   manageSubscription,
//   managePaymentMethod,
//   getInvoices,
//   getProduct,
//   getAllProducts,
//   getCoupon,
// }
